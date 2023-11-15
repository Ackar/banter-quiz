package main

import (
	"context"
	"embed"
	_ "embed"
	"io/fs"
	"log"
	"log/slog"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/graph-gophers/graphql-go"
	"github.com/graph-gophers/graphql-go/relay"
	"github.com/graph-gophers/graphql-transport-ws/graphqlws"
	"github.com/rs/cors"
)

//go:embed schema.graphql
var schema string

//go:embed frontend_dist
var frontend embed.FS

func main() {
	triviaAPI := NewTriviaAPIClient()

	r := newResolver(triviaAPI)
	schema := graphql.MustParseSchema(schema, r, graphql.UseFieldResolvers())

	mux := http.NewServeMux()
	graphQLHandler := graphqlws.NewHandlerFunc(schema, &relay.Handler{Schema: schema}, graphqlws.WithContextGenerator(
		graphqlws.ContextGeneratorFunc(func(ctx context.Context, r *http.Request) (context.Context, error) {
			return context.WithValue(ctx, UserIDKey{}, r.Context().Value(UserIDKey{})), nil
		}),
	),
	)
	mux.Handle("/query", graphQLHandler)
	frontendContent, _ := fs.Sub(frontend, "frontend_dist")
	mux.Handle("/", FileMiddleware(http.FileServer(http.FS(frontendContent))))

	corsMiddleware := cors.New(cors.Options{
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
		AllowedOrigins:   []string{"http://localhost:*", "https://banter.sycl.dev"},
		AllowedMethods: []string{
			http.MethodHead,
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodPatch,
			http.MethodDelete,
		},
	})
	handler := corsMiddleware.Handler(mux)
	handler = CookieMiddleware(handler)

	slog.Info("listening...")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

type UserIDKey struct{}

func CookieMiddleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var userID string

		idCookie, err := r.Cookie("user-id")
		if err != nil || idCookie.Value == "" {
			userID = uuid.New().String()
			http.SetCookie(w, &http.Cookie{
				Name:     "user-id",
				Value:    userID,
				HttpOnly: true,
				Path:     "/",
				SameSite: http.SameSiteDefaultMode, // change to lax for local dev
			})
		} else {
			userID = idCookie.Value
		}

		ctx := context.WithValue(r.Context(), UserIDKey{}, userID)
		h.ServeHTTP(w, r.WithContext(ctx))
	})
}

func FileMiddleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/new") || strings.HasPrefix(r.URL.Path, "/game") || strings.HasPrefix(r.URL.Path, "/join") {
			r.URL.Path = "/"
		}
		h.ServeHTTP(w, r)
	})
}

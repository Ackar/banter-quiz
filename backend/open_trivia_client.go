package main

import (
	"encoding/json"
	"fmt"
	"html"
	"net/http"
	"time"
)

type OpenTriviaClient struct {
	httpClient http.Client
}

func NewOpenTriviaClient() *OpenTriviaClient {
	return &OpenTriviaClient{
		httpClient: http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

type Question struct {
	Question         string
	CorrectAnswer    string   `json:"correct_answer"`
	IncorrectAnswers []string `json:"incorrect_answers"`
	Category         string
}

type openTriviaResponse struct {
	Results []Question
}

func (c *OpenTriviaClient) GetQuestions() ([]Question, error) {
	resp, err := c.httpClient.Get("https://opentdb.com/api.php?amount=15")
	if err != nil {
		return nil, fmt.Errorf("getting questions: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("open trivia returned an error (%d)", resp.StatusCode)
	}

	var res openTriviaResponse
	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return nil, fmt.Errorf("error decoding response: %w", err)
	}

	for i := range res.Results {
		res.Results[i].Question = html.UnescapeString(res.Results[i].Question)
		res.Results[i].CorrectAnswer = html.UnescapeString(res.Results[i].CorrectAnswer)
		for j := range res.Results[i].IncorrectAnswers {
			res.Results[i].IncorrectAnswers[j] = html.UnescapeString(res.Results[i].IncorrectAnswers[j])
		}
	}

	return res.Results, nil
}

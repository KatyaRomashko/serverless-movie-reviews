import { Review } from '../shared/types';

export const reviews: Review[] = [
  {
    reviewId: "1",
    movieId: 1234,
    reviewerName: "user1@example.com",
    reviewText: "Great movie! Loved the action scenes.",
    rating: 5,
    createdAt: "2023-10-01T12:00:00Z",
  },
  {
    reviewId: "2",
    movieId: 1234,
    reviewerName: "user2@example.com",
    reviewText: "The plot was a bit predictable.",
    rating: 3,
    createdAt: "2023-10-02T12:00:00Z",
  },
  {
    reviewId: "3",
    movieId: 2345,
    reviewerName: "user3@example.com",
    reviewText: "Amazing cinematography!",
    rating: 4,
    createdAt: "2023-10-03T12:00:00Z",
  },
];

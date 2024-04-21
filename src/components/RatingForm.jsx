import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { BASE_URL } from '../constants';
import { ToastError, ToastSuccess } from '../plugins/toast';

const RatingForm = ({id}) => {
    axios.defaults.withCredentials = true;
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [formValid, setFormValid] = useState(false);

  const handleRatingChange = (event) => {
    setRating(event.target.value);
    checkFormValidity(event.target.value, comment);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
    checkFormValidity(rating, event.target.value);
  };

  const checkFormValidity = (rating, comment) => {
    if (rating && comment) {
      setFormValid(true);
    } else {
      setFormValid(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(comment,rating);
  if (formValid) {
        try {
          const response = await axios.post(`${BASE_URL}/api/product/${id}/reviews`, { rating, comment });
          console.log('Review submitted:', response.data);
          // Add logic for success (e.g., show success message)
          if(response.data.message==="review added"){
            ToastSuccess("review added succesfully")
          }
        } catch (error) {
          console.error('Error submitting review:', error);
          ToastError("something went wrong")
          // Add logic for error handling (e.g., show error message)
        }
      } else {
        console.log('Please fill in all fields');
        // Add logic for incomplete form (e.g., show error message)
      }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="ratingSelect">
        <Form.Label>Rating</Form.Label>
        <Form.Select value={rating} onChange={handleRatingChange}>
          <option value="">Select a rating</option>
          <option value="1">Inferior</option>
          <option value="2">Decent</option>
          <option value="3">Great</option>
          <option value="4">Excellent</option>
          <option value="5">Exceptional</option>
        </Form.Select>
      </Form.Group>

      <Form.Group controlId="commentTextarea">
        <Form.Label>Comment</Form.Label>
        <Form.Control as="textarea" value={comment} onChange={handleCommentChange} rows={3} />
      </Form.Group>

      <Button style={{ backgroundColor: 'hotpink', color: 'black',border:"none" }} className='mt-3' type="submit" disabled={!formValid}>
        Submit
      </Button>
    </Form>
  );
};

export default RatingForm;

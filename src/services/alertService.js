// src/services/alertService.js
import axios from 'axios';

export const triggerCrisisAlert = async (studentId, message) => {
  try {
    const response = await axios.post(
      process.env.REACT_APP_POWER_AUTOMATE_ENDPOINT,
      {
        studentId,
        message
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.status === 200;
  } catch (error) {
    console.error('Alert failed:', error);
    return false;
  }
};
// src/services/powerAutomate.js
import axios from "axios";
import { POWER_AUTOMATE_ENDPOINT } from "../utils/constants";

export const alertCounselor = (studentId, message) => {
  axios.post(POWER_AUTOMATE_ENDPOINT, { studentId, message })
    .then(() => console.log("Alert sent successfully"))
    .catch(err => console.error("Error sending alert:", err));
};

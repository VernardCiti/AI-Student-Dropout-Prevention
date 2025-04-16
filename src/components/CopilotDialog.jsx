import React, { useState, useRef, useEffect } from 'react';
import './CopilotDialog.css';

// List of recommended resources based on risk factors
const RECOMMENDED_RESOURCES = {
  academic: [
    { id: 'a1', name: 'Study Skills Workshop', type: 'Workshop', description: 'Learn effective study techniques and time management' },
    { id: 'a2', name: 'Academic Support Groups', type: 'Group', description: 'Peer-led sessions for challenging subjects' },
    { id: 'a3', name: 'Tutoring Services', type: 'Service', description: 'One-on-one help with specific subjects' }
  ],
  attendance: [
    { id: 'at1', name: 'Attendance Improvement Plan', type: 'Plan', description: 'Structured approach to improving attendance' },  
    { id: 'at2', name: 'Transportation Assistance', type: 'Service', description: 'Help with getting to school reliably' },
    { id: 'at3', name: 'Morning Check-in Program', type: 'Program', description: 'Daily accountability and support' }
  ],
  behavioral: [
    { id: 'b1', name: 'Behavioral Support Groups', type: 'Group', description: 'Peer support for behavioral challenges' },
    { id: 'b2', name: 'Mentorship Program', type: 'Program', description: 'One-on-one guidance with a staff mentor' },
    { id: 'b3', name: 'Self-regulation Workshop', type: 'Workshop', description: 'Techniques for managing emotions and behaviors' }
  ],
  emotional: [
    { id: 'e1', name: 'Counseling Services', type: 'Service', description: 'Professional emotional support' },
    { id: 'e2', name: 'Mindfulness Program', type: 'Program', description: 'Stress reduction and emotional regulation' },
    { id: 'e3', name: 'Peer Support Group', type: 'Group', description: 'Connect with others facing similar challenges' }
  ],
  engagement: [
    { id: 'en1', name: 'Interest-based Learning', type: 'Program', description: 'Connecting curriculum to student interests' },
    { id: 'en2', name: 'Extracurricular Activities', type: 'Activity', description: 'Finding engaging activities outside classroom' },
    { id: 'en3', name: 'Project-based Learning', type: 'Program', description: 'Hands-on learning through projects' }
  ]
};

const CopilotDialog = ({ student, onClose, resources = [] }) => {
  const [messages, setMessages] = useState([
    { 
      type: 'system', 
      content: `Hello! I'm your Student Support Copilot. I can help analyze ${student?.Name || 'this student'}'s risk factors and suggest resources.`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Process student data on initial load
  useEffect(() => {
    if (student) {
      analyzeStudentData();
    }
  }, [student]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const analyzeStudentData = () => {
    if (!student) return;
    
    // Find highest risk factors
    const risks = student.detailedRisks || {};
    const sortedRisks = Object.entries(risks)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, value]) => value > 30); // Only consider medium to high risks
    
    // Generate initial recommendations based on top risk factors
    const topRecommendations = [];
    sortedRisks.slice(0, 2).forEach(([category]) => {
      const categoryResources = RECOMMENDED_RESOURCES[category] || [];
      topRecommendations.push(...categoryResources.slice(0, 2));
    });
    
    setRecommendations(topRecommendations);
    
    // Add initial analysis message
    if (sortedRisks.length > 0) {
      const riskMessage = `I've analyzed ${student.Name}'s data and found the following risk areas: ${
        sortedRisks.map(([category, value]) => `${category} (${value}%)`).join(', ')
      }.`;
      
      setMessages(prev => [...prev, { type: 'system', content: riskMessage }]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: inputValue }]);
    const userQuery = inputValue.toLowerCase();
    setInputValue('');
    
    // Simulate AI thinking
    setIsTyping(true);
    
    // Process the query after a slight delay to simulate thinking
    setTimeout(() => {
      setIsTyping(false);
      processUserQuery(userQuery);
    }, 1000);
  };
  
  const processUserQuery = (query) => {
    // Extract risk level from student data
    const overallRisk = student?.RiskScore || 0;
    const risks = student?.detailedRisks || {};
    let response = '';
    
    // Handle different query intents
    if (query.includes('risk') || query.includes('status')) {
      // Risk assessment
      let riskLevel = overallRisk >= 70 ? 'high' : overallRisk >= 30 ? 'medium' : 'low';
      
      response = `${student.Name} currently has a ${riskLevel} risk level (${overallRisk}%). `;
      
      if (Object.keys(risks).length > 0) {
        response += 'Breaking this down by category:\n\n';
        
        Object.entries(risks).forEach(([category, value]) => {
          const categoryRiskLevel = value >= 70 ? 'high' : value >= 30 ? 'medium' : 'low';
          response += `- ${category.charAt(0).toUpperCase() + category.slice(1)}: ${categoryRiskLevel} (${value}%)\n`;
        });
      }
    } 
    else if (query.includes('recommend') || query.includes('resource') || query.includes('help') || query.includes('suggest')) {
      // Resource recommendations
      const topRisks = Object.entries(risks)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([category]) => category);
      
      response = `Based on ${student.Name}'s profile, I recommend focusing on these areas: `;
      response += topRisks.map(category => category.charAt(0).toUpperCase() + category.slice(1)).join(' and ');
      response += '.\n\nHere are some suggested resources:\n\n';
      
      // Find resources for top risk categories
      const suggestedResources = [];
      topRisks.forEach(category => {
        const categoryResources = RECOMMENDED_RESOURCES[category] || [];
        suggestedResources.push(...categoryResources.slice(0, 2));
      });
      
      // Display resources in the response
      suggestedResources.forEach(resource => {
        response += `- ${resource.name} (${resource.type}): ${resource.description}\n`;
      });
      
      // Update recommendations state
      setRecommendations(suggestedResources);
    }
    else if (query.includes('attendance') || query.includes('absent') || query.includes('missing')) {
      // Attendance specific info
      const attendanceRisk = risks.attendance || 0;
      response = `${student.Name}'s attendance risk is ${attendanceRisk}%. `;
      
      if (attendanceRisk >= 70) {
        response += 'This is a serious concern that needs immediate attention. ';
        response += 'I recommend implementing an Attendance Improvement Plan and connecting with the family to understand underlying issues.';
      } else if (attendanceRisk >= 30) {
        response += 'This is a moderate concern that should be monitored. ';
        response += 'Consider a check-in system and regular communication with the student and family.';
      } else {
        response += 'Attendance is currently not a major concern for this student.';
      }
    }
    else if (query.includes('academic') || query.includes('grades') || query.includes('assignments')) {
      // Academic specific info
      const academicRisk = risks.academic || 0;
      response = `${student.Name}'s academic risk is ${academicRisk}%. `;
      
      if (academicRisk >= 70) {
        response += 'This indicates significant academic struggles. ';
        response += 'I recommend immediate tutoring support, study skills workshops, and a meeting with all teachers to develop a coordinated support plan.';
      } else if (academicRisk >= 30) {
        response += 'There are some academic concerns that should be addressed. ';
        response += 'Consider targeted tutoring in specific subjects and helping the student develop better study habits.';
      } else {
        response += 'Academic performance is currently not a major concern for this student.';
      }
    }
    else if (query.includes('emotional') || query.includes('mental') || query.includes('wellbeing')) {
      // Emotional/mental health specific info
      const emotionalRisk = risks.emotional || 0;
      response = `${student.Name}'s emotional risk indicator is at ${emotionalRisk}%. `;
      
      if (emotionalRisk >= 70) {
        response += 'This suggests significant emotional challenges. ';
        response += 'I recommend referral to the school counselor or mental health services, as well as implementing additional support structures in the classroom.';
      } else if (emotionalRisk >= 30) {
        response += 'There are some emotional concerns that should be monitored. ';
        response += 'Consider check-ins with the school counselor and mindfulness activities.';
      } else {
        response += 'Emotional wellbeing is currently not flagged as a major concern for this student.';
      }
    }
    else if (query.includes('engagement') || query.includes('participation') || query.includes('interest')) {
      // Engagement specific info
      const engagementRisk = risks.engagement || 0;
      response = `${student.Name}'s engagement risk is ${engagementRisk}%. `;
      
      if (engagementRisk >= 70) {
        response += 'This indicates very low engagement with school activities. ';
        response += 'I recommend exploring the student\'s interests and connecting curriculum to these interests, plus considering project-based learning approaches.';
      } else if (engagementRisk >= 30) {
        response += 'There are some engagement concerns that should be addressed. ';
        response += 'Consider incorporating more interactive activities and connecting learning to real-world applications.';
      } else {
        response += 'Engagement is currently not a major concern for this student.';
      }
    }
    else if (query.includes('behavioral') || query.includes('behavior') || query.includes('discipline')) {
      // Behavioral specific info
      const behavioralRisk = risks.behavioral || 0;
      response = `${student.Name}'s behavioral risk indicator is at ${behavioralRisk}%. `;
      
      if (behavioralRisk >= 70) {
        response += 'This suggests significant behavioral challenges. ';
        response += 'I recommend implementing a behavior intervention plan, regular check-ins, and possibly connecting with a mentor.';
      } else if (behavioralRisk >= 30) {
        response += 'There are some behavioral concerns that should be monitored. ';
        response += 'Consider clear expectations, positive reinforcement systems, and self-regulation strategies.';
      } else {
        response += 'Behavior is currently not flagged as a major concern for this student.';
      }
    }
    else if (query.includes('intervention') || query.includes('plan') || query.includes('strategy')) {
      // Intervention plan recommendations
      const highRiskCategories = Object.entries(risks)
        .filter(([_, value]) => value >= 70)
        .map(([category]) => category);
      
      response = 'Based on the data, I recommend the following intervention strategy:\n\n';
      
      if (highRiskCategories.length > 0) {
        response += '1. Priority areas that need immediate attention:\n';
        highRiskCategories.forEach(category => {
          response += `   - ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
        });
        response += '\n';
      }
      
      response += '2. Steps for creating an intervention plan:\n';
      response += '   - Schedule a meeting with the student and relevant staff\n';
      response += '   - Set specific, measurable goals for improvement\n';
      response += '   - Identify resources and strategies for each risk area\n';
      response += '   - Establish regular check-ins to monitor progress\n';
      response += '   - Review and adjust the plan every 2-3 weeks\n\n';
      
      response += '3. Documentation:\n';
      response += '   - Document all interventions and communications\n';
      response += '   - Track progress metrics for each risk area\n';
      response += '   - Share updates with all stakeholders regularly';
    }
    else {
      // General/default response
      response = `I'm here to help with ${student.Name}'s academic progress. You can ask me about:
      
- Their current risk level and factors
- Recommended resources and interventions
- Specific concerns like attendance, academic performance, engagement, etc.
- Strategies for creating an intervention plan

What specific aspect would you like to know more about?`;
    }
    
    // Add system response
    setMessages(prev => [...prev, { type: 'system', content: response }]);
  };

  const handleResourceClick = (resource) => {
    // Here you would implement the logic to assign/recommend the resource to the student
    setMessages(prev => [
      ...prev, 
      { 
        type: 'system', 
        content: `I've added "${resource.name}" to ${student.Name}'s recommended resources.` 
      }
    ]);
  };

  return (
    <div className="copilot-dialog-overlay">
      <div className="copilot-dialog">
        <div className="copilot-header">
          <h3>Student Support Copilot</h3>
          <span className="student-name">{student?.Name || 'Student'}</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="copilot-content">
          <div className="chat-container">
            <div className="messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.type}`}>
                  {msg.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              ))}
              {isTyping && (
                <div className="message system typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSubmit} className="chat-input">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about this student's needs..."
                disabled={isTyping}
              />
              <button type="submit" disabled={isTyping || !inputValue.trim()}>
                Send
              </button>
            </form>
          </div>
          
          <div className="recommendations-panel">
            <h4>Recommended Resources</h4>
            {recommendations.length > 0 ? (
              <ul className="resource-list">
                {recommendations.map(resource => (
                  <li key={resource.id} className="resource-item">
                    <div className="resource-info">
                      <span className="resource-name">{resource.name}</span>
                      <span className="resource-type">{resource.type}</span>
                    </div>
                    <p className="resource-description">{resource.description}</p>
                    <button 
                      className="assign-btn"
                      onClick={() => handleResourceClick(resource)}
                    >
                      Assign
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-recommendations">
                Ask about this student's needs to get resource recommendations.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopilotDialog;
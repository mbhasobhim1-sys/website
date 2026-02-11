-- Seed some example forms
INSERT INTO public.forms (title, description, category, fields, is_public, requires_auth)
VALUES
(
  'Employee Registration Form',
  'New employee onboarding registration form. Please fill out all required fields accurately.',
  'registration',
  '[
    {"id": "full_name", "label": "Full Name", "type": "text", "required": true, "placeholder": "Enter your full name"},
    {"id": "email", "label": "Email Address", "type": "email", "required": true, "placeholder": "your.email@company.com"},
    {"id": "phone", "label": "Phone Number", "type": "tel", "required": true, "placeholder": "+1 (555) 000-0000"},
    {"id": "department", "label": "Department", "type": "select", "required": true, "options": ["Engineering", "Marketing", "Sales", "Human Resources", "Finance", "Operations"]},
    {"id": "start_date", "label": "Start Date", "type": "date", "required": true},
    {"id": "position", "label": "Position Title", "type": "text", "required": true, "placeholder": "e.g., Software Engineer"},
    {"id": "emergency_contact", "label": "Emergency Contact Name", "type": "text", "required": true, "placeholder": "Full name of emergency contact"},
    {"id": "emergency_phone", "label": "Emergency Contact Phone", "type": "tel", "required": true, "placeholder": "+1 (555) 000-0000"},
    {"id": "notes", "label": "Additional Notes", "type": "textarea", "required": false, "placeholder": "Any additional information..."}
  ]'::jsonb,
  true,
  true
),
(
  'Customer Feedback Survey',
  'We value your feedback! Please take a moment to share your experience with our services.',
  'survey',
  '[
    {"id": "name", "label": "Your Name", "type": "text", "required": false, "placeholder": "Optional"},
    {"id": "email", "label": "Email", "type": "email", "required": false, "placeholder": "Optional - for follow-up"},
    {"id": "rating", "label": "Overall Satisfaction", "type": "radio", "required": true, "options": ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]},
    {"id": "service_type", "label": "Which service did you use?", "type": "select", "required": true, "options": ["Customer Support", "Product Purchase", "Technical Assistance", "Billing Inquiry", "Other"]},
    {"id": "recommend", "label": "Would you recommend us to others?", "type": "radio", "required": true, "options": ["Definitely", "Probably", "Not Sure", "Probably Not", "Definitely Not"]},
    {"id": "comments", "label": "Comments or Suggestions", "type": "textarea", "required": false, "placeholder": "Tell us how we can improve..."}
  ]'::jsonb,
  true,
  false
),
(
  'Business License Application',
  'Application form for new business license. All fields marked with * are mandatory.',
  'government',
  '[
    {"id": "business_name", "label": "Business Name", "type": "text", "required": true, "placeholder": "Legal business name"},
    {"id": "owner_name", "label": "Owner Full Name", "type": "text", "required": true, "placeholder": "Full legal name"},
    {"id": "owner_email", "label": "Owner Email", "type": "email", "required": true, "placeholder": "owner@business.com"},
    {"id": "owner_phone", "label": "Phone Number", "type": "tel", "required": true, "placeholder": "+1 (555) 000-0000"},
    {"id": "business_type", "label": "Type of Business", "type": "select", "required": true, "options": ["Sole Proprietorship", "Partnership", "LLC", "Corporation", "Non-Profit"]},
    {"id": "address", "label": "Business Address", "type": "text", "required": true, "placeholder": "Full street address"},
    {"id": "start_date", "label": "Proposed Start Date", "type": "date", "required": true},
    {"id": "employees", "label": "Number of Employees", "type": "number", "required": true, "placeholder": "0"},
    {"id": "description", "label": "Business Description", "type": "textarea", "required": true, "placeholder": "Describe the nature of your business..."},
    {"id": "agree_terms", "label": "I agree to the terms and conditions", "type": "checkbox", "required": true, "placeholder": "I certify that all information provided is accurate"}
  ]'::jsonb,
  true,
  true
),
(
  'Event Registration',
  'Register for our upcoming community event. Open to all - no account required.',
  'registration',
  '[
    {"id": "attendee_name", "label": "Full Name", "type": "text", "required": true, "placeholder": "Your full name"},
    {"id": "attendee_email", "label": "Email Address", "type": "email", "required": true, "placeholder": "your@email.com"},
    {"id": "attendee_phone", "label": "Phone Number", "type": "tel", "required": false, "placeholder": "Optional"},
    {"id": "ticket_type", "label": "Ticket Type", "type": "radio", "required": true, "options": ["General Admission", "VIP", "Student"]},
    {"id": "dietary", "label": "Dietary Requirements", "type": "select", "required": false, "options": ["None", "Vegetarian", "Vegan", "Gluten-Free", "Halal", "Kosher", "Other"]},
    {"id": "special_needs", "label": "Special Accommodations", "type": "textarea", "required": false, "placeholder": "Any accessibility or special requirements..."}
  ]'::jsonb,
  true,
  false
);

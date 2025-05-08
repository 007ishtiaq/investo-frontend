import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Mail,
  Phone,
  Paperclip,
  X,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { sendContactMessage } from "../functions/user";
import "./Contact.css";

// Validation schema with Yup
const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name is too short")
    .max(50, "Name is too long")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  subject: Yup.string()
    .min(5, "Subject is too short")
    .max(100, "Subject is too long")
    .required("Subject is required"),
  message: Yup.string()
    .min(10, "Message is too short")
    .max(1000, "Message is too long")
    .required("Message is required"),
});

const Contact = () => {
  const { user } = useSelector((state) => ({ ...state }));

  // File attachment state
  const [attachment, setAttachment] = useState(null);
  const [fileName, setFileName] = useState("");
  const [filePreview, setFilePreview] = useState("");

  // FAQ state
  const [expandedFaq, setExpandedFaq] = useState(null);

  // FAQ data
  const faqData = [
    {
      id: 1,
      question: "How do I make a deposit?",
      answer:
        "You can make a deposit by going to your wallet and selecting the 'Deposit' option. Follow the instructions to complete your deposit using your preferred payment method.",
    },
    {
      id: 2,
      question: "How long do withdrawals take to process?",
      answer:
        "Withdrawal requests are typically processed within 24-48 hours. Once approved, the funds will be sent to your specified payment method, which may take additional time depending on your bank or payment provider.",
    },
    {
      id: 3,
      question: "How does the referral system work?",
      answer:
        "Our referral system allows you to earn rewards by inviting others to join our platform. When someone signs up using your referral link and makes a deposit, you'll receive a commission based on your current level.",
    },
    {
      id: 4,
      question: "What are the different investment plans?",
      answer:
        "We offer various investment plans with different returns and durations. You can view all available plans in the 'Investment' section of your dashboard. Each plan has specific details about the potential returns and timeframe.",
    },
    {
      id: 5,
      question: "How do I verify my account?",
      answer:
        "Account verification requires submitting your identification documents through the 'Verification' section in your profile. This helps us ensure security and comply with regulations.",
    },
  ];

  // Handle file attachment
  const handleFileChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setFileName(file.name);
    setFieldValue("fileName", file.name);
    setFieldValue("attachment", file);

    // Create object URL for preview
    if (file.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview("");
    }
  };

  // Remove attachment
  const removeAttachment = (setFieldValue) => {
    setAttachment(null);
    setFieldValue("attachment", null);
    setFieldValue("fileName", "");
    setFileName("");

    // Clean up object URL to avoid memory leaks
    if (filePreview && filePreview.startsWith("blob:")) {
      URL.revokeObjectURL(filePreview);
    }
    setFilePreview("");
  };

  // Toggle FAQ
  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Show loading state
      setSubmitting(true);

      // API call using function from functions folder
      const response = await sendContactMessage(
        {
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message,
          attachment: values.attachment,
          fileName: values.fileName,
        },
        user?.token
      );

      // Show success message
      toast.success("Your message has been sent successfully!");

      // Reset form
      resetForm();
      setAttachment(null);
      setFileName("");

      // Clean up any object URLs to avoid memory leaks
      if (filePreview && filePreview.startsWith("blob:")) {
        URL.revokeObjectURL(filePreview);
      }
      setFilePreview("");
    } catch (error) {
      console.error("Contact form submission error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to send message. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="contact-hero-content">
          <h1>Contact Us</h1>
          <p>Have questions or need assistance? We're here to help you.</p>
        </div>

        <div className="contact-form-wrapper">
          <div className="contact-form-container">
            <div className="contact-quick-info">
              <div className="quick-info-item">
                <Mail size={18} />
                <span>support@yourplatform.com</span>
              </div>
              <div className="quick-info-item">
                <Phone size={18} />
                <span>+1 (123) 456-7890</span>
              </div>
            </div>

            <Formik
              initialValues={{
                name: user?.name || "",
                email: user?.email || "",
                subject: "",
                message: "",
                attachment: null,
                fileName: "",
              }}
              validationSchema={ContactSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, setFieldValue }) => (
                <Form className="contact-form">
                  <div className="form-group">
                    <label htmlFor="name">Your Name</label>
                    <Field
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Enter your name"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="name"
                      component="span"
                      className="error-message"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Your Email</label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email address"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="email"
                      component="span"
                      className="error-message"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <Field
                      type="text"
                      id="subject"
                      name="subject"
                      placeholder="Enter subject"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="subject"
                      component="span"
                      className="error-message"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <Field
                      as="textarea"
                      id="message"
                      name="message"
                      rows="5"
                      placeholder="Enter your message"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="message"
                      component="span"
                      className="error-message"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="attachment" className="file-input-label">
                      <Paperclip size={16} />
                      <span>Attach File (Optional)</span>
                    </label>
                    <input
                      type="file"
                      id="attachment"
                      onChange={(e) => handleFileChange(e, setFieldValue)}
                      className="file-input"
                    />

                    {fileName && (
                      <div className="file-preview">
                        {filePreview && (
                          <div className="image-preview">
                            <img src={filePreview} alt="Attachment preview" />
                          </div>
                        )}
                        <div className="file-info">
                          <span className="file-name">{fileName}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(setFieldValue)}
                            className="remove-file"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="loading-spinner"></span>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container">
        <div className="faq-section">
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <div className="faq-container">
            {faqData.map((faq) => (
              <div
                key={faq.id}
                className={`faq-item ${
                  expandedFaq === faq.id ? "expanded" : ""
                }`}
              >
                <div className="faq-question" onClick={() => toggleFaq(faq.id)}>
                  <h3>{faq.question}</h3>
                  {expandedFaq === faq.id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
                {expandedFaq === faq.id && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

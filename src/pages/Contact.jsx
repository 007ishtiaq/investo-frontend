import React, { useState, useEffect } from "react";
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
import NoNetModal from "../components/NoNetModal/NoNetModal";
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

  // Network modal state
  const [noNetModal, setNoNetModal] = useState(false);

  // Add network status monitoring
  useEffect(() => {
    const handleOnlineStatus = () => {
      if (navigator.onLine) {
        setNoNetModal(false);
      }
    };

    const handleOfflineStatus = () => {
      setNoNetModal(true);
    };

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOfflineStatus);

    // Check initial status
    if (!navigator.onLine) {
      setNoNetModal(true);
    }

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOfflineStatus);
    };
  }, []);

  // FAQ data
  const faqData = [
    {
      id: 1,
      question: "How do I make a deposit?",
      answer:
        "You can deposit any amount by sending USDT to the wallet address provided in the deposit form in the app. Make sure to follow the instructions carefully.",
    },
    {
      id: 2,
      question: "How long do withdrawals take to process?",
      answer:
        "Withdrawal requests are usually processed within 24 to 48 hours. After admin approval, funds are sent to the wallet address you provided in the withdrawal form.",
    },
    {
      id: 3,
      question: "How does the referral system work?",
      answer:
        "You earn commissions by inviting others to the platform. When someone joins through your referral link and purchases a plan, you receive a percentage of their investment based on your level.",
    },
    {
      id: 4,
      question: "What are the different investment plans?",
      answer:
        "We offer a range of investment plans, each with different daily reward percentages. You can view and purchase them in the 'Invest' section of your dashboard or from Plans Page.",
    },
    {
      id: 5,
      question: "How do investment plans work?",
      answer:
        "You purchase a plan and complete daily tasks. Based on your plan and task percentage, you earn daily rewards which are credited to your in-app wallet.",
    },
    {
      id: 6,
      question: "When will I receive my rewards?",
      answer:
        "Rewards are credited daily to your in-app wallet after you complete the assigned tasks for the day.",
    },
    {
      id: 7,
      question: "Can I withdraw early from an investment plan?",
      answer:
        "Our plans are flexible, but early withdrawal may not return full rewards. It’s recommended to complete the plan cycle to receive full benefits.",
    },
    {
      id: 8,
      question: "Is there a maximum investment amount?",
      answer:
        "No, there’s no maximum limit. You can invest as much as you are comfortable with.",
    },
    {
      id: 9,
      question: "Do I need to complete tasks daily?",
      answer:
        "Yes, completing tasks daily is required to receive rewards. Missing a task may result in no reward for that day.",
    },
    {
      id: 10,
      question: "How do I join the affiliate program?",
      answer:
        "Every registered user automatically gets an affiliate link, which they can use to invite others and start earning commissions.",
    },
    {
      id: 11,
      question: "How are commissions calculated?",
      answer:
        "Commissions depend on your current level and your team's structure. Direct referrals earn a fixed daily amount, while deeper levels give percentage-based rewards. For a detailed breakdown, please refer to the example and commission table on the My Team page.",
    },
    {
      id: 12,
      question: "When do I receive my commission payments?",
      answer:
        "Commissions are added instantly to your in-app wallet whenever a team member purchases a plan through your referral. There's no waiting — earnings are credited in real-time.",
    },
    {
      id: 13,
      question: "How do I increase my account level?",
      answer:
        "Your account level increases when you purchase higher-value plans. Higher levels unlock greater affiliate commission rates.",
    },
    {
      id: 14,
      question: "Is there a limit to how many people I can refer?",
      answer:
        "No, you can refer unlimited users and build your team as large as you like.",
    },
    {
      id: 15,
      question: "Do my referrals expire?",
      answer:
        "No, once a user registers through your link, they stay permanently linked to your team.",
    },
    {
      id: 16,
      question: "Do I need to invest to earn affiliate commissions?",
      answer:
        "Yes, to activate affiliate earnings, you need to have at least one active investment plan.",
    },
    {
      id: 17,
      question: "Is my investment safe?",
      answer:
        "We use secure, industry-standard systems to protect your data and wallet. However, as with any investment, please assess your risk before participating.",
    },
    {
      id: 19,
      question: "Where can I see my earnings and transactions?",
      answer:
        "All rewards, deposits, and withdrawals are listed in the wallet section of your dashboard with full history and timestamps.",
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
    // Check network status before submitting
    if (!navigator.onLine) {
      setNoNetModal(true);
      setSubmitting(false);
      return;
    }

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

      // Check if it's a network error
      if (
        (error.message && error.message.includes("network")) ||
        error.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        setNoNetModal(true);
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to send message. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    if (navigator.onLine) {
      setNoNetModal(false);
      // Form is ready for new submission attempts
    } else {
      toast.error("Still no internet connection. Please check your network.");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
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
                  <span>support@trustyvest.com</span>
                </div>
                {/* <div className="quick-info-item">
                  <Phone size={18} />
                  <span>+1 (123) 456-7890</span>
                </div> */}
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
          <div className="faq-section-contact">
            <h2 className="faq-title-contact">Frequently Asked Questions</h2>
            <div className="faq-container-contact">
              {faqData.map((faq) => (
                <div
                  key={faq.id}
                  className={`faq-item-contact ${
                    expandedFaq === faq.id ? "expanded" : ""
                  }`}
                >
                  <div
                    className="faq-question-contact"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <h3>{faq.question}</h3>
                    {expandedFaq === faq.id ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                  {expandedFaq === faq.id && (
                    <div className="faq-answer-contact">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <NoNetModal
        classDisplay={noNetModal ? "show" : ""}
        setNoNetModal={setNoNetModal}
        handleRetry={handleRetry}
      />
    </>
  );
};

export default Contact;

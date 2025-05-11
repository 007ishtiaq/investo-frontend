// pages/admin/ContactMessages.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  PenLine,
  RefreshCw,
  Inbox,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  getAllContactMessages,
  updateContactStatus,
  addContactNote,
} from "../../functions/admin";
import toast from "react-hot-toast";
import "./ContactMessages.css";

// Format date without date-fns
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

const StatCard = ({ title, value, icon, color, linkTo, onClick }) => {
  const Icon = icon;
  return (
    <div className="analytics-stat-card" onClick={onClick}>
      <div className={`analytics-stat-card-icon ${color}`}>
        <Icon size={24} />
      </div>
      <div className="analytics-stat-card-content">
        <h3 className="analytics-stat-card-title">{title}</h3>
        <div className="analytics-stat-card-value-container">
          <p className="analytics-stat-card-value">{value}</p>
        </div>
      </div>
      {linkTo && (
        <Link to={linkTo} className="analytics-stat-card-link">
          View all
        </Link>
      )}
    </div>
  );
};

const ContactMessages = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [expandedContact, setExpandedContact] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [stats, setStats] = useState({
    all: 0,
    new: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  });

  // Load contacts on component mount or when page changes
  useEffect(() => {
    loadContacts();
  }, [currentPage]);

  // Update stats whenever contacts change
  useEffect(() => {
    updateStats();
  }, [contacts]);

  const updateStats = () => {
    const newStats = {
      all: totalItems, // Use totalItems for all count
      new: contacts.filter((c) => c.status === "new").length,
      in_progress: contacts.filter((c) => c.status === "in_progress").length,
      resolved: contacts.filter((c) => c.status === "resolved").length,
      closed: contacts.filter((c) => c.status === "closed").length,
    };
    setStats(newStats);
  };

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await getAllContactMessages(
        user.token,
        currentPage,
        itemsPerPage
      );

      // Update state with the contacts and pagination info
      setContacts(response.data.contacts);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);

      setLoading(false);
    } catch (error) {
      console.error("Load contacts error:", error);
      toast.error("Failed to load contact messages");
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Toggle contact expansion
  const toggleContact = (id) => {
    setExpandedContact(expandedContact === id ? null : id);
    setNoteText("");
  };

  // Filter contacts based on active tab
  const getFilteredContacts = () => {
    if (activeTab === "all") {
      return contacts;
    }
    return contacts.filter((contact) => contact.status === activeTab);
  };

  // Handle status update
  const handleStatusUpdate = async (id, status) => {
    try {
      setStatusUpdating(true);
      await updateContactStatus(id, status, user.token);

      // Update local state
      setContacts(
        contacts.map((contact) =>
          contact._id === id ? { ...contact, status } : contact
        )
      );

      toast.success(`Status updated to ${status}`);
      setStatusUpdating(false);
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status");
      setStatusUpdating(false);
    }
  };

  // Handle note submission
  const handleAddNote = async (id) => {
    if (!noteText.trim()) {
      return toast.error("Note cannot be empty");
    }

    try {
      setAddingNote(true);
      const response = await addContactNote(id, noteText, user.token);

      // Update local state
      setContacts(
        contacts.map((contact) =>
          contact._id === id ? response.data : contact
        )
      );

      setNoteText("");
      toast.success("Note added successfully");
      setAddingNote(false);
    } catch (error) {
      console.error("Add note error:", error);
      toast.error("Failed to add note");
      setAddingNote(false);
    }
  };

  // Open image modal
  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl);
    setImageModalOpen(true);
  };

  // Get appropriate status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "new":
        return "status-new";
      case "in_progress":
        return "status-progress";
      case "resolved":
        return "status-resolved";
      case "closed":
        return "status-closed";
      default:
        return "status-new";
    }
  };

  // When changing tabs, reset to page 1
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="admin-access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access contact messages.</p>
        <Link to="/" className="back-link">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-analytics">
      <div className="analytics-header">
        <h1>Contact Messages</h1>
        <p>View and manage customer inquiries</p>
        <button
          className="refresh-button"
          onClick={loadContacts}
          disabled={loading}
        >
          <RefreshCw size={16} />
          <span>{loading ? "Refreshing..." : "Refresh Messages"}</span>
        </button>
      </div>

      <div className="analytics-section">
        <h2 className="analytics-section-title">Quick Status</h2>
        <div className="analytics-stat-grid">
          <StatCard
            title="All Messages"
            value={stats.all}
            icon={Inbox}
            color="blue"
            onClick={() => handleTabChange("all")}
          />
          <StatCard
            title="New Messages"
            value={stats.new}
            icon={MessageSquare}
            color="amber"
            onClick={() => handleTabChange("new")}
          />
          <StatCard
            title="In Progress"
            value={stats.in_progress}
            icon={Clock}
            color="purple"
            onClick={() => handleTabChange("in_progress")}
          />
          <StatCard
            title="Resolved"
            value={stats.resolved}
            icon={CheckCircle}
            color="green"
            onClick={() => handleTabChange("resolved")}
          />
        </div>
      </div>

      <div className="contact-tabs">
        <button
          className={`tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => handleTabChange("all")}
        >
          <Inbox size={16} />
          <span>All Messages</span>
        </button>
        <button
          className={`tab ${activeTab === "new" ? "active" : ""}`}
          onClick={() => handleTabChange("new")}
        >
          <MessageSquare size={16} />
          <span>New</span>
        </button>
        <button
          className={`tab ${activeTab === "in_progress" ? "active" : ""}`}
          onClick={() => handleTabChange("in_progress")}
        >
          <Clock size={16} />
          <span>In Progress</span>
        </button>
        <button
          className={`tab ${activeTab === "resolved" ? "active" : ""}`}
          onClick={() => handleTabChange("resolved")}
        >
          <CheckCircle size={16} />
          <span>Resolved</span>
        </button>
        <button
          className={`tab ${activeTab === "closed" ? "active" : ""}`}
          onClick={() => handleTabChange("closed")}
        >
          <XCircle size={16} />
          <span>Closed</span>
        </button>
      </div>

      {loading ? (
        <div className="analytics-loading">
          <div className="analytics-loading-spinner"></div>
          <p>Loading contact messages...</p>
        </div>
      ) : getFilteredContacts().length === 0 ? (
        <div className="analytics-error">
          <AlertCircle size={40} color="#6b7280" />
          <h2>No Messages Found</h2>
          <p>There are no messages in this category.</p>
        </div>
      ) : (
        <>
          <div className="contacts-list">
            {getFilteredContacts().map((contact) => (
              <div
                key={contact._id}
                className={`contact-item ${
                  expandedContact === contact._id ? "expanded" : ""
                }`}
              >
                <div
                  className="contact-header"
                  onClick={() => toggleContact(contact._id)}
                >
                  <div className="contact-info">
                    <div className="contact-subject">{contact.subject}</div>
                    <div className="contact-meta">
                      <div className="contact-name">{contact.name}</div>
                      <div className="contact-date">
                        {formatDate(contact.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="contact-indicators">
                    {contact.attachment && (
                      <span className="has-attachment" title="Has attachment">
                        <FileText size={16} />
                      </span>
                    )}
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        contact.status
                      )}`}
                    >
                      {contact.status.charAt(0).toUpperCase() +
                        contact.status.slice(1).replace("_", " ")}
                    </span>
                    {expandedContact === contact._id ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </div>

                {expandedContact === contact._id && (
                  <div className="contact-details">
                    <div className="contact-body">
                      <div className="detail-section">
                        <h3>Customer Information</h3>
                        <div className="detail-item">
                          <span className="detail-label">Name:</span>
                          <span className="detail-value">{contact.name}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Email:</span>
                          <span className="detail-value">{contact.email}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Date:</span>
                          <span className="detail-value">
                            {formatDate(contact.createdAt)}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Status:</span>
                          <div className="status-selector">
                            <select
                              value={contact.status}
                              onChange={(e) =>
                                handleStatusUpdate(contact._id, e.target.value)
                              }
                              disabled={statusUpdating}
                            >
                              <option value="new">New</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="detail-section">
                        <h3>Message</h3>
                        <div className="message-content">{contact.message}</div>
                        {contact.attachment && (
                          <div className="attachment-section">
                            <h3>Attachment</h3>
                            <div className="attachment-preview">
                              <img
                                src={contact.attachment}
                                alt="Attachment"
                                onClick={() =>
                                  openImageModal(contact.attachment)
                                }
                                className="attachment-thumbnail"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {contact.notes && contact.notes.length > 0 && (
                        <div className="detail-section">
                          <h3>Admin Notes</h3>
                          <div className="notes-list">
                            {contact.notes.map((note, idx) => (
                              <div key={idx} className="note-item">
                                <div className="note-content">{note.text}</div>
                                <div className="note-meta">
                                  <span className="note-author">
                                    {note.addedBy ? note.addedBy : "Admin"}
                                  </span>
                                  <span className="note-date">
                                    {formatDate(note.addedAt)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="detail-section">
                        <h3>Add Note</h3>
                        <div className="note-form">
                          <textarea
                            placeholder="Add an internal note about this inquiry..."
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            rows="3"
                            className="note-textarea"
                          ></textarea>
                          <button
                            className="add-note-button"
                            onClick={() => handleAddNote(contact._id)}
                            disabled={addingNote || !noteText.trim()}
                          >
                            <PenLine size={16} />
                            <span>{addingNote ? "Adding..." : "Add Note"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination Controls - Only show for "all" tab */}
          {activeTab === "all" && totalPages > 0 && (
            <div className="pagination">
              <button
                className="page-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages} ({totalItems} messages)
              </span>
              <button
                className="page-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {imageModalOpen && (
        <div className="image-modal">
          <div className="image-modal-content">
            <button
              className="close-modal-button"
              onClick={() => setImageModalOpen(false)}
            >
              ×
            </button>
            <img src={modalImage} alt="Attachment Preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;

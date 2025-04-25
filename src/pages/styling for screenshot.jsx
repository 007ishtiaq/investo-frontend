<>
{
  !activeTask.completed &&
    activeTask.status !== "pending_verification" &&
    activeTask.startedAt &&
    verificationStatus === "idle" && (
      <div className="verification-section">
        {/* Screenshot upload for screenshot type tasks */}
        {activeTask.type === "screenshot" && (
          <div className="screenshot-upload-container">
            <h4>Upload Screenshot</h4>
            <p>
              {activeTask.screenshotInstructions ||
                "Take a screenshot showing you've completed this task and upload it here."}
            </p>

            {screenshotPreview ? (
              <div className="screenshot-preview">
                <img src={screenshotPreview} alt="Screenshot preview" />
                <button
                  className="remove-screenshot-button"
                  onClick={() => {
                    setScreenshot(null);
                    setScreenshotPreview(null);
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="screenshot-upload-box">
                <input
                  type="file"
                  id="screenshot-upload"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="screenshot-upload" className="upload-label">
                  <div className="upload-icon">
                    <Camera size={24} />
                  </div>
                  <span>Click to upload screenshot</span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Text input for other task types */}
        {[
          "youtube_subscribe",
          "youtube_watch",
          "twitter_follow",
          "twitter_share",
          "telegram_join",
        ].includes(activeTask.type) && (
          <div className="verification-input-container">
            <label htmlFor="verification-input">
              {activeTask.type === "youtube_subscribe"
                ? "Enter Channel URL:"
                : activeTask.type === "youtube_watch"
                ? "Enter Video URL:"
                : activeTask.type.includes("twitter")
                ? "Enter Tweet URL:"
                : "Enter Telegram Username:"}
            </label>
            <input
              id="verification-input"
              type="text"
              value={verificationInput}
              onChange={(e) => setVerificationInput(e.target.value)}
              placeholder={
                activeTask.type === "youtube_subscribe"
                  ? "https://youtube.com/channel/..."
                  : activeTask.type === "youtube_watch"
                  ? "https://youtube.com/watch?v=..."
                  : activeTask.type.includes("twitter")
                  ? "https://twitter.com/..."
                  : "@username"
              }
              disabled={verificationStatus === "verifying"}
            />
          </div>
        )}

        <button
          className="verify-task-button"
          onClick={() => verifyTask(activeTask._id)}
          disabled={
            verificationStatus === "verifying" ||
            verificationStatus === "complete" ||
            ([
              "youtube_subscribe",
              "youtube_watch",
              "twitter_follow",
              "twitter_share",
              "telegram_join",
            ].includes(activeTask.type) &&
              !verificationInput) ||
            (activeTask.type === "screenshot" && !screenshot)
          }
        >
          {verificationStatus === "verifying"
            ? "Verifying..."
            : verificationStatus === "complete"
            ? "Verified!"
            : "Verify Completion"}
        </button>
      </div>
    );
}
</>
InboxSDK.load(2, "sdk_NesaDocLock_70621e1bb4").then(function (sdk) {
  // the SDK has been loaded, now do something with it!
  sdk.Toolbars.registerThreadButton({
    title: "Encrypt File",
    iconUrl: chrome.runtime.getURL("logos/logo_128.png"),
    iconClass: "nesa-btn",
    positions: ["THREAD"],
    listSection: sdk.Toolbars.SectionNames.OTHER,
    onClick: (event) => btnClickHandler(event, sdk),
  });
});

const btnClickHandler = async (event, sdk) => {
  let sender, loggedInUser, attachment, attachment_name;
  if (event.position === "THREAD") {
    loggedInUser = await sdk.User.getEmailAddress();

    await sdk.Conversations.registerMessageViewHandler(async (messageView) => {
      sender = messageView.getSender();

      attachment =
        messageView.getFileAttachmentCardViews()[0] &&
        messageView.getFileAttachmentCardViews()[0]
          ._attachmentCardImplementation &&
        messageView.getFileAttachmentCardViews()[0]
          ._attachmentCardImplementation._element
          ? messageView.getFileAttachmentCardViews()[0]
              ._attachmentCardImplementation._element
          : [];

      !Array.isArray(attachment)
        ? (attachment_name = messageView
            .getFileAttachmentCardViews()[0]
            ._attachmentCardImplementation._element.innerText.split(/\n/)[1])
        : (attachment_name = "");
    });

    Email.send({
      SecureToken: "ce8a1081-19cd-4ab5-bc49-8b0f9b893d64",
      // Host: "smtp.gmail.com",
      // Username: "nisadoclock@gmail.com",
      // Password: "nisafinance",
      To: loggedInUser,
      From: "nisadoclock@gmail.com",
      Subject: "Protected file reverted by NisaDoclock",
      Body:
        "Download the attachment from this mail and upload it as your documents in NisaFinance",
      Attachments: [
        {
          name: `Nisa_Encrypted_${attachment_name}`,
          path:
            "https://networkprogramming.files.wordpress.com/2017/11/smtpjs.png",
        },
      ],
    }).then((message) => {
      if (message === "OK") {
        alert("Protected file has been reverted to your mail");
      } else {
        alert(
          "Mail sending failed, please try again or contact Nisa Finance Support"
        );
      }
    });
  }
};

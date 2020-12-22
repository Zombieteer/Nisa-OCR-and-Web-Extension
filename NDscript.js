let inboxSdkId = "sdk_NesaDocLock_70621e1bb4";
let mailClientSecureToken = "ce8a1081-19cd-4ab5-bc49-8b0f9b893d64";

InboxSDK.load(2, inboxSdkId).then(function (sdk) {
  // the SDK has been loaded, now do something with it!
  sdk.Toolbars.registerThreadButton({
    title: "Encrypt File",
    iconUrl: chrome.runtime.getURL("logos/logo_128.png"),
    iconClass: "nisa-btn",
    positions: ["THREAD"],
    listSection: sdk.Toolbars.SectionNames.OTHER,
    onClick: (event) => btnClickHandler(event, sdk),
  });
});

const getAttachments = async (sdk) => {
  let attachments = [];
  let sender;
  await sdk.Conversations.registerMessageViewHandler(async (messageView) => {
    sender = messageView.getSender();

    messageView.getFileAttachmentCardViews().length &&
      messageView.getFileAttachmentCardViews().forEach((item) => {
        let attachment = item._attachmentCardImplementation._element;
        let download_url = attachment.attributes.getNamedItem("download_url")
          .textContent;
        let re = /([^:]+):([^:]+):(.+)/;
        let match = re.exec(download_url);

        const contentType = match[1];
        const name = decodeURI(match[2]);
        const contentLink = match[3];

        fetch(contentLink)
          .then((response) => {
            const reader = response.body.getReader();
            return new ReadableStream({
              start(controller) {
                return pump();
                function pump() {
                  return reader.read().then(({ done, value }) => {
                    if (done) {
                      controller.close();
                      return;
                    }
                    controller.enqueue(value);
                    return pump();
                  });
                }
              },
            });
          })
          .then((stream) => new Response(stream))
          .then((response) => response.blob())
          .then((blob) => {
            let file = new File([blob], name, { type: contentType });
            // const url = URL.createObjectURL(file);

            // let link = document.createElement("a");
            // link.href = url;
            // link.setAttribute("download", "file.pdf");
            // link.click();
          })
          .catch((err) => console.error(err));

        attachments.push({
          name: `Nisa_Encrypted_${name}`,
          path: contentLink,
        });

        console.log(match);
      });
  });
  return {attachments, sender};
};

const sendMail = (sdk, loggedInUser, attachments) => {
  const showModal = (title, message) => {
    let mail_sent_modal = sdk.Widgets.showModalView({
      title,
      el: `<div>${message}</div>`,
      buttons: [
        {
          text: "Ok",
          type: "PRIMARY_ACTION",
          showCloseButton: true,
          onClick: () => mail_sent_modal.close(),
        },
      ],
    });
    document.querySelector(".inboxsdk__modal_content").style.margin = 0;
  };

  Email.send({
    SecureToken: mailClientSecureToken,
    // Host: "smtp.gmail.com",
    // Username: "nisadoclock@gmail.com",
    // Password: "nisafinance",
    To: loggedInUser,
    From: "nisadoclock@gmail.com",
    Subject: "Protected file reverted by NisaDoclock",
    Body:
      "Download the attachment from this mail and upload it as your documents in NisaFinance",
    Attachments: attachments,
  }).then((message) => {
    if (message === "OK") {
      showModal("Success", "Mail has been reverted, please check inbox");
    } else {
      showModal(
        "Failed / Error",
        "Mail sending failed, please try again or contact support@nisafinance.com"
      );
    }
  });
};

const btnClickHandler = async (event, sdk) => {
  let loggedInUser;
  if (event.position === "THREAD") {
    loggedInUser = await sdk.User.getEmailAddress();

    let attachment_read_modal = sdk.Widgets.showModalView({
      title: "Please Wait...",
      el: "<div>Attachments are being read</div>",
    });
    document.querySelector(".inboxsdk__modal_content").style.marginTop = 0;

    // get attachments
    let {attachments, sender} = await getAttachments(sdk);

    attachment_read_modal.close();

    // encrypt file

    // send mail
    sendMail(sdk, loggedInUser, attachments);
  }
};

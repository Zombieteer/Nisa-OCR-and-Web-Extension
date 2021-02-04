let env = chrome.runtime.getManifest().env;
let { inboxSdkId, mailClientSecureToken } = env;

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

const btnClickHandler = async (event, sdk) => {
  if (event.position === "THREAD") {
    // check if user exist in data base
    let ifuserExist = await isUserExist(sdk);
    if (ifuserExist === null) return;
    // get attachments
    else if (ifuserExist) await getAttachments(sdk);
    else if (ifuserExist === false) {
      // open user not found modal
      let user_not_found_modal = sdk.Widgets.showModalView({
        title: "User Not Found",
        el: `<div>You are not registered with Nisa Doclock</div>
        <p>Get yourself registered from 
        <a href='${env.nesaDoclockWeb}/register'>here</a>
        </p>`,
        buttons: [
          {
            text: "Ok",
            type: "PRIMARY_ACTION",
            showCloseButton: true,
            onClick: () => user_not_found_modal.close(),
          },
        ],
      });
      document.querySelector(".inboxsdk__modal_content").style.marginTop = 0;
      document.querySelector(".inboxsdk__modal_content").style.marginBottom = 0;
    }
  }
};

const isUserExist = async (sdk) => {
  let { getUserUri } = env;
  let loggedInUser = await sdk.User.getEmailAddress();
  try {
    let res = await fetch(getUserUri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: loggedInUser }),
    });
    res = await res.json();
    if (res.user) {
      return true;
    } else return false;
  } catch (error) {
    console.log(error);
    errorModal(sdk, "Server Error");
    return null;
  }
};

const getAttachments = async (sdk) => {
  let unRegister = await sdk.Conversations.registerMessageViewHandler(
    async (messageView) => {
      let filesToEncypt = [];
      let sender;
      sender = messageView.getSender().emailAddress;
      let items = messageView.getFileAttachmentCardViews();
      //retrieve attachments to encrypt
      if (messageView.getViewState() === "EXPANDED") {
        if (messageView.isLoaded() && items.length) {
          // open getting attachment modal
          // let attachment_read_modal = sdk.Widgets.showModalView({
          //   title: "Please Wait...",
          //   el: "<div>Attachments are being read</div>",
          // });
          // document.querySelector(
          //   ".inboxsdk__modal_content"
          // ).style.marginTop = 0;
          for (let item of items) {
            try {
              let attachment = item._attachmentCardImplementation._element;
              let download_url = attachment.attributes.getNamedItem(
                "download_url"
              ).textContent;
              let re = /([^:]+):([^:]+):(.+)/;
              let match = re.exec(download_url);
              const contentType = match[1];
              const fileName = decodeURI(match[2]).split(".");
              const name =
                fileName.slice(0, fileName.length - 1) +
                " (Nisa Protected)." +
                fileName[fileName.length - 1];
              const contentLink = match[3];
              if (contentType === "application/pdf") {
                let response = await fetch(contentLink);
                let blob = await response.blob();
                let file = new File([blob], name);
                // let url = URL.createObjectURL(file);
                // let link = document.createElement("a");
                // link.href = url;
                // link.setAttribute("download", "file.pdf");
                // link.click();
                filesToEncypt.push({
                  name: name,
                  file,
                });
              }
              console.log(match);
            } catch (error) {
              errorModal(sdk, error);
              console.log(error);
            }
          }
          console.log("attachment retrieved", filesToEncypt);
          // close getting attachment modal
          // attachment_read_modal.close();
          // encrypt file
          if (filesToEncypt.length) {
            encryptFile(sdk, sender, filesToEncypt);
          } else {
            // open no attachment found modal
            let no_attachment_found = sdk.Widgets.showModalView({
              title: "Recheck the message file",
              el:
                "<div>No pdf Attachments were found within opened message</div>",
              buttons: [
                {
                  text: "Ok",
                  type: "PRIMARY_ACTION",
                  showCloseButton: true,
                  onClick: () => no_attachment_found.close(),
                },
              ],
            });
            document.querySelector(
              ".inboxsdk__modal_content"
            ).style.marginTop = 0;
            document.querySelector(
              ".inboxsdk__modal_buttons"
            ).style.paddingTop = 0;
          }
        } else {
          // open no attachment found modal
          let no_attachment_found = sdk.Widgets.showModalView({
            title: "Recheck the message file",
            el: "<div>No Attachments were found within opened message</div>",
            buttons: [
              {
                text: "Ok",
                type: "PRIMARY_ACTION",
                showCloseButton: true,
                onClick: () => no_attachment_found.close(),
              },
            ],
          });
          document.querySelector(
            ".inboxsdk__modal_content"
          ).style.marginTop = 0;
          document.querySelector(
            ".inboxsdk__modal_buttons"
          ).style.paddingTop = 0;
        }
      }
    }
  );
  unRegister();
};

const encryptFile = async (sdk, sender, filesToEncypt) => {
  // open encrypting modal
  // let encrypt_file_modal = sdk.Widgets.showModalView({
  //   title: "Please Wait...",
  //   el: "<div>Files are being Protected</div>",
  // });
  // document.querySelector(".inboxsdk__modal_content").style.marginTop = 0;

  let filesToRevert = [];

  try {
    let loggedInUser = await sdk.User.getEmailAddress();
    for (let encyptedFile of filesToEncypt) {
      console.log(encyptedFile);
      let data = new FormData();
      data.append("file", encyptedFile.file);
      data.append("email", loggedInUser);
      data.append("mailSender", sender);
      let { encryptUri } = env;

      let res = await fetch(encryptUri, {
        method: "POST",
        body: data,
      });
      res = await res.blob();

      console.log(res);
      let fileToRevert = new File([new Blob([res])], encyptedFile.name, {
        type: "application/pdf",
      });
      filesToRevert.push({
        name: encyptedFile.name,
        data: await toBase64(fileToRevert),
      });
    }

    console.log(filesToRevert);
    // close files are beign encrypted modal
    // encrypt_file_modal.close();

    // send mail
    let attachments = [...filesToRevert];
    // let attachments = [];
    sendMail(sdk, attachments);
  } catch (error) {
    encrypt_file_modal.close();
    errorModal(sdk, error);
    console.log(error);
  }
};

const toBase64 = (fileToRevert) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(fileToRevert);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const sendMail = async (sdk, attachments) => {
  // open sending mail modal
  // let sending_mail_modal = sdk.Widgets.showModalView({
  //   title: "Please Wait...",
  //   el: "<div>Mail is being reverter with protected attachments</div>",
  // });
  // document.querySelector(".inboxsdk__modal_content").style.marginTop = 0;

  const showResponseModal = (title, message) => {
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

  let loggedInUser = await sdk.User.getEmailAddress();

  Email.send({
    SecureToken: mailClientSecureToken,
    // Host: "smtp.gmail.com",
    // Username: "nisadoclock@gmail.com",
    // Password: "nisafinance",
    To: loggedInUser,
    From: env.mimicMailToSendFrom,
    Subject: "Protected file reverted by NisaDoclock",
    Body:
      "Download the attachment from this mail and upload it as your documents in NisaFinance",
    Attachments: attachments,
  }).then((message) => {
    if (message === "OK") {
      // close sending mail modal
      // sending_mail_modal.close();
      showResponseModal(
        "Success",
        "Mail has been reverted, please check inbox"
      );
    } else {
      sending_mail_modal.close();
      showResponseModal(
        "Failed / Error",
        "Mail sending failed, please try again or contact support@nisafinance.com"
      );
    }
  });
};

const errorModal = (sdk, error) => {
  let error_Modal = sdk.Widgets.showModalView({
    title: "Error... ",
    el: `<div>${error}</div>
          <div>Please try again later, or contact Nisa Finance</div>`,
    buttons: [
      {
        text: "Ok",
        type: "PRIMARY_ACTION",
        showCloseButton: true,
        onClick: () => error_Modal.close(),
      },
    ],
  });
  document.querySelector(".inboxsdk__modal_content").style.margin = 0;
};

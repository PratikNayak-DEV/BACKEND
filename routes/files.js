const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuid } = require("uuid");

let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

let upload = multer({
  storage: storage,
  limit: { fileSize: 1000000 * 100 },
}).single("myfile");

router.post("/", (req, res) => {
  //Store files on Uploads folder
  upload(req, res, async (err) => {
    //Vlidate request

    if (!req.file) {
      return res.json({ error: "All fields are required" });
    }

    if (err) {
      return res.status(500).send("error : err.message");
    }
    //Store to Database (Data of the file)
    const file = new File({
      filename: req.file.filename,
      uuid: uuid(),
      path: req.file.path,
      size: req.file.size,
    });

    const response = await file.save();
    return res.json({
      file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
    });
    //http://localhost:4000/files/133143pnfoowvov-woeifb(uuid)
  });
  //Response -> Link (Download Link)
});

router.post("/send", async (req, res) => {
  const { uuid, emailTo, emailFrom } = req.body;
  // Validate Request
  if (!uuid || !emailTo || !emailFrom) {
    return res.status(422).send({ error: "All fields are required." });
  }

  // Get data from database
  const file = await File.findOne({ uuid: uuid });
  if (file.sender) {
    return res.status(422).send({ error: "Email already sent." });
  }
  file.sender = emailFrom;
  file.reciver = emailTo;

  const response = await file.save();

  // Send email
  const sendMail = require("../services/emailService");
  sendMail({
    from: emailFrom,
    to: emailTo,
    subject: "FileLinker file sharing",
    text: `${emailFrom} shared a file with you.`,
    html: require("../services/emailTemplate")({
      emailFrom: emailFrom,
      downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
      size: parseInt(file.size / 1000) + " KB",
      expires: "24 hours",
    }),
  });
  return res.send({ success: true });
});

module.exports = router;

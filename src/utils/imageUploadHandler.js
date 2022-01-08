const multer = require('multer');

function handleImageUpload(imageName) {
    const storage = multer.diskStorage({
        destination: 'uploads/',
        filename: function (req, file, callBack) {
            callBack(null, req.user.userID);
        }
    });

    const upload = multer({ storage }).single(imageName);
    const responseCreator = require("../utils/responseCreator");
    return (req, res) => {
        upload(req, res, (error) => {
            if (error)
                return res
                    .status(400)
                    .send(responseCreator("error", "Request can't be proceed"));
            else
                res
                    .status(200)
                    .send(responseCreator("success", "Successfully updated profile image"));
        })
    }
}

module.exports = handleImageUpload

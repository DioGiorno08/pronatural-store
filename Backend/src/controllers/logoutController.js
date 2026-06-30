const logoutController = {};

logoutController.logout = async (req, res) => {

    res.clearCookie("authCookie");

    return res.status(200).json({ message: "Sesión cerrada" });
};

export default logoutController;
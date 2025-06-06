const getHomePage = (req,res) => {
    res.json({
        message: "hello world",
        data: {
            title: "nice title",
            description: "short description"
        }
    })
}

module.exports = {
    getHomePage
}
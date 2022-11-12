const productHelpers = require('../helpers/product-helpers')

module.exports = {

  userProductListPageination: async (req, res, next) => {
    console.log("---------query");
    console.log(req.query);
    console.log("---------query");

    const page = parseInt(req.query.page)
    // const limit = parseInt(req.query.limit)
    const limit = 3
    console.log(page);
    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const results = {}
    let productsCount = await productHelpers.getProductsCount()

    if (endIndex < productsCount) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }
    try {
      results.products = await productHelpers.getPaginatedResult(limit, startIndex)
      results.pageCount = Math.ceil(parseInt(productsCount) / parseInt(limit)).toString()
      results.pages = Array.from({ length: results.pageCount }, (_, i) => i + 1)
      results.currentPage = page.toString()
      results.limit = limit
      results.startIndex = startIndex
      res.paginatedResults = results
      next()
    } catch (e) {
      res.status(500).json({ message: e.message })
    }

  }
}
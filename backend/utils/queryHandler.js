class QueryHandler {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  //   search functionalty
  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  //   filter functionalty
  filter() {
    const queryCopy = { ...this.queryStr };
    const removeFields = ["page", "keyword", "limit"];

    removeFields.forEach((key) => {
      delete queryCopy[key];
    });
    // filter for price and rating;
    let queryString = JSON.stringify(queryCopy);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (key) => `$${key}`
    );

    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }

  //   pagination;
  pagination() {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = (currentPage - 1) * this.queryStr.limit;

    this.query = this.query.limit(this.queryStr.limit).skip(skip);

    return this;
  }

  // resolve
  resolve() {
    this.search().filter().pagination()

    return this
  }
}

module.exports = QueryHandler;

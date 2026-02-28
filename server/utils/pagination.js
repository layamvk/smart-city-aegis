const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse safe pagination parameters from request query.
 * @param {import('express').Request} req
 * @returns {{ page: number, limit: number, skip: number }}
 */
const parsePagination = (req) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

module.exports = { parsePagination };

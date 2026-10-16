const publicPlayer = (p) => {
    const o = typeof p.toObject === 'function' ? p.toObject() : p;
    return {
        _id: o._id,
        name: o.name,
        role: o.role,
        stats: o.stats,
        overallRating: o.overallRating,
        pool: o.pool,
        basePrice: o.basePrice,
        status: o.status,
        soldPrice: o.soldPrice,
        retentionPrice: o.retentionPrice
    };
};

module.exports = { publicPlayer };
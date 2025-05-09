const got = require('@/utils/got');

module.exports = async (ctx) => {
    const shop = ctx.params.shop;

    const domains = [
        `https://www.${shop}.com`,
        `https://${shop}.com`,
        `https://www.${shop}.net`,
        `https://${shop}.net`,
    ];

    let data;
    let finalBaseUrl = null;

    for (const base of domains) {
        try {
            const response = await got(`${base}/api/store/products/?sort=created-descending`);
            const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
            if (Array.isArray(body?.data)) {
                data = body.data;
                finalBaseUrl = base;
                break;
            }
        } catch (err) {
            // 可以打印日志辅助调试
        }
    }

    if (!data || !finalBaseUrl) {
        ctx.throw(404, 'No valid data found from supported domains.');
    }

    ctx.state.data = {
        title: `M-${shop}`,
        link: `${finalBaseUrl}/`,
        description: `${shop}`,
        item: data.map((item) => ({
            title: item.title,
            description: `销量：${item.total_sales}<br>
                          上架时间：${item.post_date}<br>
                          评论：${item.comment_count}<br>
                          SKU: ${item.sku} ${item.min_price_variant?.sku || ''}<br>
                          <img src="${item.image}">`,
            pubDate: new Date(item.time * 1000).toUTCString(),
            link: item.public_url,
        })),
    };
};

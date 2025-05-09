const got = require('@/utils/got');

module.exports = async (ctx) => {
    const domain = ctx.params.shop; // 现在传的是完整域名，如 river-golden.com

    const prefixes = [
        `https://www.${domain}`,
    ];

    let data;
    let finalBaseUrl = null;

    for (const base of prefixes) {
        try {
            const response = await got(`${base}/api/store/products/?sort=created-descending`);
            const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
            if (Array.isArray(body?.data)) {
                data = body.data;
                finalBaseUrl = base;
                break;
            }
        } catch (err) {
            // 可加日志辅助调试
        }
    }

    if (!data || !finalBaseUrl) {
        ctx.throw(404, 'No valid data found for given domain.');
    }

    ctx.state.data = {
        title: `M-${domain}`,
        link: `${finalBaseUrl}/`,
        description: `${domain}`,
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

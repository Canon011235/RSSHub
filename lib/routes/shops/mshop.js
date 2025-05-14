const got = require('@/utils/got');

module.exports = async (ctx) => {
    const shop = ctx.params.shop;

    const response = await got({
        method: 'get',
        url: `https://www.${shop}.com/api/store/products/?sort=created-descending`,
    });

    const data = response.data.data;

    ctx.state.data = {
        title: `M-${shop}`,
        link: `https://www.${shop}.com/`,
        description: `${shop}`,
        item: data.map((item) => ({
            title: item.title,
            description: `销量：${item.total_sales}<br>
                          上架时间：${item.post_date}<br>
                          评论：${item.comment_count}<br>
                          SKU: ${item.sku} ${item.min_price_variant.sku}<br>
                          <img src="${item.image}">`,
            pubDate: new Date(item.time * 1000).toUTCString(),
            link: `${item.public_url}`,
        })),
    };
};

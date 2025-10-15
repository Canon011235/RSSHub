const got = require('@/utils/got');

module.exports = async (ctx) => {
    const shop = ctx.params.shop;

    const { data: resp } = await got({
        method: 'get',
        url: `https://www.${shop}.com/api/store/products/?sort=created-descending`,
    });

    const data = resp.data || [];

    ctx.state.data = {
        title: `M-${shop}`,
        link: `https://www.${shop}.com/`,
        description: `前端展示图由 JSON 拼接生成，无需爬取页面`,
        item: data.map((item) => {
            // 按优先级选择图片字段
            const rawImg = item.feature_image?.url || item.gallery?.[0]?.url || item.image || '';

            // Hotishop 前端展示图常加 ?h=1，可选
            const frontImg = rawImg ? `${rawImg}?h=1` : '';

            return {
                title: item.title,
                link: item.public_url,
                description: `
                    销量：${item.total_sales ?? 0}<br>
                    评论：${item.comment_count ?? 0}<br>
                    SKU: ${item.sku ?? ''} ${item.min_price_variant?.sku ?? ''}<br>
                    <img style="max-width:100%;height:auto" src="${frontImg}">
                `,
                enclosure_url: frontImg,
                enclosure_type: 'image/jpeg',
            };
        }),
    };
};

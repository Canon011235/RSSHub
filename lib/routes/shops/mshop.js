const got = require('@/utils/got');

module.exports = async (ctx) => {
    const shop = ctx.params.shop;

    const { data: resp } = await got({
        method: 'get',
        url: `https://www.${shop}.com/api/store/products/?sort=created-descending`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            Accept: 'application/json, text/plain, */*',
            Referer: `https://www.${shop}.com/`,
            Origin: `https://www.${shop}.com`,
        },
    });

    const data = resp.data || [];

    ctx.state.data = {
        title: `M-${shop}`,
        link: `https://www.${shop}.com/`,
        description: `测试更新1211`,
        item: data.map((item) => {
            const rawImg = item.feature_image?.url || item.gallery?.[0]?.url || item.image || '';
            const frontImg = rawImg ? `${rawImg}?h=1` : '';

            return {
                title: item.title,
                link: item.public_url,
                description: `
                    销量：${item.total_sales ?? 0}<br>
                    评论：${item.comment_count ?? 0}<br>
                    SKU: ${item.sku ?? ''} ${item.min_price_variant?.sku ?? ''}<br>
                    <img src="${frontImg}">
                `,
                enclosure_url: frontImg,
                enclosure_type: 'image/jpeg',
                enclosure_length: 0, // ★ 必须：修复 FreshRSS & W3C 校验失败
            };
        }),
    };
};

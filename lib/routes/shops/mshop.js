const got = require('@/utils/got');

// 选取图片字段
function pickImage(item) {
    return item?.feature_image?.url || item?.image || (item?.gallery && item.gallery[0]?.url) || '';
}

// 转为无Referer代理 + 强制输出jpg
function toProxy(url) {
    if (!url) {
        return '';
    }
    const u = url.replace(/^https?:\/\//, '');
    return `https://images.weserv.nl/?url=${encodeURIComponent(u)}&output=jpg`;
}

// 判断文件类型
function guessMime(url) {
    const ext = (url.split('?')[0].split('.').pop() || '').toLowerCase();
    if (ext === 'gif') {
        return 'image/gif';
    }
    if (ext === 'webp') {
        return 'image/webp';
    }
    if (ext === 'png') {
        return 'image/png';
    }
    return 'image/jpeg';
}

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
        description: String(shop),
        item: data.map((item) => {
            const rawImg = pickImage(item);
            const proxied = toProxy(rawImg);

            // Inoreader 会显示第一个 img
            const imgTag = proxied ? `<img referrerpolicy="no-referrer" style="max-width:100%;height:auto" src="${proxied}">` : '';

            return {
                title: item.title,
                link: String(item.public_url || item.path || `https://www.${shop}.com/`),
                pubDate: new Date((item.time ?? Math.floor(Date.now() / 1000)) * 1000).toUTCString(),
                description: `
                    销量：${item.total_sales ?? 0}<br>
                    上架时间：${item.post_date ?? ''}<br>
                    评论：${item.comment_count ?? 0}<br>
                    SKU: ${item.sku ?? ''} ${item.min_price_variant?.sku ?? ''}<br>
                    ${imgTag}
                `,
                enclosure_url: proxied || rawImg || '',
                enclosure_type: guessMime(rawImg),
            };
        }),
    };
};

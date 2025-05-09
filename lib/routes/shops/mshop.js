const got = require('@/utils/got');

module.exports = async (ctx) => {
  const shop = ctx.params.shop; // e.g., "myshop"

  const domains = [
    `https://www.${shop}.com`,
    `https://${shop}.com`,
    `https://www.${shop}.net`,
    `https://${shop}.net`,
  ];

  let response;
  for (const base of domains) {
    try {
      response = await got({
        method: 'get',
        url: `${base}/api/store/products/?sort=created-descending`,
        timeout: 3000, // 可选，防止长时间等待
      });
      break; // 成功就跳出循环
    } catch (err) {
      // 可以打印错误用于调试
      // console.error(`Failed on ${base}`, err.message);
    }
  }

  if (!response) {
    ctx.throw(404, 'Shop not found on supported domains.');
  }

    const data = response.data.data;

    ctx.state.data = {
        // 源标题
        title: `M-${shop}`,
        // 源链接
        link: `https://www.${shop}.com/`,
        // 源说明
        description: `${shop}`,
        //遍历此前获取的数据
        item: data.map((item) => ({
            // 文章标题
            title: item.title,
            // 文章正文
            description: `销量：${item.total_sales}<br>
                          上架时间：${item.post_date}<br>
                          评论：${item.comment_count}<br>
                          SKU: ${item.sku} ${item.min_price_variant.sku}<br>
                          <img src="${item.image}">
                          `,
            // 文章发布时间
            pubDate: new Date(item.time * 1000).toUTCString(),
            // 文章链接
            link: `${item.public_url}`,
        })),
    };
}

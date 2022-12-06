const response = got({
    method: 'get',
    url: `https://www.${shop}.com/api/store/products/?sort=created-descending`,
});

const data = response.data.data;

ctx.state.data = {
    // 源标题
    title: `${shop} 的产品订阅`,
    // 源链接
    link: `https://www.${shop}.com/`,
    // 源说明
    description: `${shop} 的产品订阅`,
    //遍历此前获取的数据
    item: data.map((item) => ({
        // 文章标题
        title: item.title,
        // 文章正文
        description: `销量：${item.total_sales}<br>上架时间：${item.post_date}<br><img src="${item.image}">`,
        // 文章发布时间
        pubDate: new Date(item.time * 1000).toUTCString(),
        // 文章链接
        link: `${item.public_url}`,
    })),
};

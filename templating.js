const nunjucks = require('nunjucks');

function createEnv(path, opts) {
    var 
        autoescape = opts.autoescape === undefined ? true : opts.autoescape,
        noCache = opts.noCache || false,
        watch = opts.watch || false,
        throwOnUndefined = opts.throwOnUndefined || false,
        env = new nunjucks.Environment(
            new nunjucks.FileSystemLoader(path || 'views', {
                noCache: noCache,
                watchL: watch,
            }), {
                autoescape: autoescape,
                throwOnUndefined: throwOnUndefined
            }
        );
    if (opts.filters) {
        for (var f in opts.filters) {
            env.addFilter(f, opts.filters[f]);
        }
    }
    return env;
}

function templating(path, opts) {
    // 创建 nunjucks 的 env 对象
    var env = createEnv(path, opts);
    return async (ctx, next) => {
        // 给 ctx 绑定 render 对象
        ctx.render = function (view, model) {
            // 把 render 后的内容赋值给 response.body
            ctx.response.body = env.render(view, Object.assign({}, ctx.state || {}, model || {}));
            // 设置 Content-Type
            ctx.response.type = 'text/html';
        };
        // 继续处理请求
        await next();
    };
}

module.exports = templating;

import { BaseRouter, routeGet } from '@backlib/koa';
import Router from '@koa/router';
import Koa, { DefaultContext } from 'koa';
import koaBody from 'koa-body';
import koaStatic from 'koa-static';
import { performance } from 'perf_hooks';

// path relative to server/
const WEB_FOLDER = './web-folder/';
const PORT = 8888;

//// EXAMPLE - hello3 - Hello3 BaseRouter class with decorator
class Hello3 extends BaseRouter {
	#count = 0;

	@routeGet('hello3')
	async hello(ctx: DefaultContext) {
		this.#count++;
		ctx.body = {
			message: `Hello3 from Server ${this.#count}`
		}
	}
}

main();

async function main() {

	const app = new Koa();

	//// Setup Koa ("Next Gen" Express with native async/await support)
	// body parser
	app.use(koaBody({ multipart: true }));

	//// Example that wrap the request to display performance
	app.use(async (ctx, next) => {
		const start = performance.now();
		await next();
		const duration  = performance.now() - start;
		console.log(`->> ${duration.toFixed(3)}ms - ${ctx.path}`);
	});

	//// Example - hello1 - Middleware for basic path matching
	let hello1Count = 0;
	app.use((ctx, next) => {
		if (ctx.path == '/wapi/hello1') {
			hello1Count++;
			ctx.body = {	
				message: `Hello1 from Server ${hello1Count}`
			}
		}
		else  {
			return next();
		}
	});


	//// Example - hello2 - @koa/router for API
	let hello2Count = 0;
	const router = new Router({prefix: '/wapi/'});
	router.get('hello2', (ctx) => {
		hello2Count++;
		ctx.body = {	
			message: `Hello2 from Server ${hello2Count}`
		}
	});
	app.use(router.routes());

	//// EXAMPLE - hello3 - BaseRouter with TS Decorator (from @backlib/koa base on @koa/router)
	const hello3 = new Hello3('/wapi/');
	app.use(hello3.middleware());

	//// If not bound, then, try to find static file
	app.use(koaStatic(WEB_FOLDER, { index: 'index.html' }));

	//// Start listening port
	app.listen(PORT);
}




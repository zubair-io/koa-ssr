import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as serve from 'koa-static';

const app = new Koa();
const fs = require('fs');
const path = require('path');
app.use(serve(path.join(__dirname, '../')));

import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import { enableProdMode } from '@angular/core';
enableProdMode();
import { platformServer, renderModule } from '@angular/platform-server';
import { AppNodeModule } from './app/app.node.module';
const index = fs.readFileSync(path.join(__dirname, '../index.html')).toString();

const router = new Router();
const pageCache = new Map();

router.get('*', async (ctx, next) => {
    let html = pageCache.get(ctx.originalUrl);
    if (html !== undefined) {
        // ctx.setHeader("Cache-Control", "public, max-age=300");
        //ctx.status(200).send(html);
        ctx.body = html;
        return;
    }
    html = await renderModule(AppNodeModule, {
        document: index,
        url: ctx.originalUrl,
    });
    pageCache.set(ctx.originalUrl, html);
    ctx.body = html;
});
app.use(router.routes()).use(router.allowedMethods());
app.listen(3000);
console.log(`Listening on Port 3000`);

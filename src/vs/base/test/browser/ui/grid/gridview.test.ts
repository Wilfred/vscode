/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import { GridView, IView } from 'vs/base/browser/ui/grid/gridview';
import { nodesToArrays, TestView } from './util';

suite('Gridview', function () {
	let container: HTMLElement;

	setup(function () {
		container = document.createElement('div');
		container.style.position = 'absolute';
		container.style.width = `${200}px`;
		container.style.height = `${200}px`;
	});

	teardown(function () {
		container = null;
	});

	test('empty gridview is empty', function () {
		const gridview = new GridView(container);
		assert.deepEqual(gridview.getViews(), { children: [] });
		gridview.dispose();
	});

	test('gridview addView', function () {
		const gridview = new GridView(container);

		const view = new TestView(20, 20, 20, 20);
		assert.throws(() => gridview.addView(view, 200, []), 'empty location');
		assert.throws(() => gridview.addView(view, 200, [1]), 'index overflow');
		assert.throws(() => gridview.addView(view, 200, [0, 0]), 'hierarchy overflow');

		const views = [
			new TestView(20, 20, 20, 20),
			new TestView(20, 20, 20, 20),
			new TestView(20, 20, 20, 20)
		];

		gridview.addView(views[0], 200, [0]);
		gridview.addView(views[1], 200, [1]);
		gridview.addView(views[2], 200, [2]);

		assert.deepEqual(nodesToArrays(gridview.getViews()), views);

		gridview.dispose();
	});

	test('gridview addView nested', function () {
		const gridview = new GridView(container);

		const views = [
			new TestView(20, 20, 20, 20),
			[
				new TestView(20, 20, 20, 20),
				new TestView(20, 20, 20, 20)
			]
		];

		gridview.addView(views[0] as IView, 200, [0]);
		gridview.addView(views[1][0] as IView, 200, [1]);
		gridview.addView(views[1][1] as IView, 200, [1, 1]);

		assert.deepEqual(nodesToArrays(gridview.getViews()), views);

		gridview.dispose();
	});

	test('gridview addView deep nested', function () {
		const gridview = new GridView(container);

		const view1 = new TestView(20, 20, 20, 20);
		gridview.addView(view1 as IView, 200, [0]);
		assert.deepEqual(nodesToArrays(gridview.getViews()), [view1]);

		const view2 = new TestView(20, 20, 20, 20);
		gridview.addView(view2 as IView, 200, [1]);
		assert.deepEqual(nodesToArrays(gridview.getViews()), [view1, view2]);

		const view3 = new TestView(20, 20, 20, 20);
		gridview.addView(view3 as IView, 200, [1, 0]);
		assert.deepEqual(nodesToArrays(gridview.getViews()), [view1, [view3, view2]]);

		const view4 = new TestView(20, 20, 20, 20);
		gridview.addView(view4 as IView, 200, [1, 0, 0]);
		assert.deepEqual(nodesToArrays(gridview.getViews()), [view1, [[view4, view3], view2]]);

		const view5 = new TestView(20, 20, 20, 20);
		gridview.addView(view5 as IView, 200, [1, 0]);
		assert.deepEqual(nodesToArrays(gridview.getViews()), [view1, [view5, [view4, view3], view2]]);

		const view6 = new TestView(20, 20, 20, 20);
		gridview.addView(view6 as IView, 200, [2]);
		assert.deepEqual(nodesToArrays(gridview.getViews()), [view1, [view5, [view4, view3], view2], view6]);

		const view7 = new TestView(20, 20, 20, 20);
		gridview.addView(view7 as IView, 200, [1, 1]);
		assert.deepEqual(nodesToArrays(gridview.getViews()), [view1, [view5, view7, [view4, view3], view2], view6]);

		const view8 = new TestView(20, 20, 20, 20);
		gridview.addView(view8 as IView, 200, [1, 1, 0]);
		assert.deepEqual(nodesToArrays(gridview.getViews()), [view1, [view5, [view8, view7], [view4, view3], view2], view6]);

		gridview.dispose();
	});

	test('simple layout', function () {
		const grid = new GridView(container);
		grid.layout(800, 600);

		const view1 = new TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE);
		grid.addView(view1, 200, [0]);
		assert.deepEqual(view1.size, [800, 600]);
		assert.deepEqual(grid.getViewSize([0]), { width: 800, height: 600 });

		const view2 = new TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE);
		grid.addView(view2, 200, [0]);
		assert.deepEqual(view1.size, [800, 400]);
		assert.deepEqual(grid.getViewSize([1]), { width: 800, height: 400 });
		assert.deepEqual(view2.size, [800, 200]);
		assert.deepEqual(grid.getViewSize([0]), { width: 800, height: 200 });

		const view3 = new TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE);
		grid.addView(view3, 200, [1, 1]);
		assert.deepEqual(view1.size, [600, 400]);
		assert.deepEqual(grid.getViewSize([1, 0]), { width: 600, height: 400 });
		assert.deepEqual(view2.size, [800, 200]);
		assert.deepEqual(grid.getViewSize([0]), { width: 800, height: 200 });
		assert.deepEqual(view3.size, [200, 400]);
		assert.deepEqual(grid.getViewSize([1, 1]), { width: 200, height: 400 });

		const view4 = new TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE);
		grid.addView(view4, 200, [0, 0]);
		assert.deepEqual(view1.size, [600, 400]);
		assert.deepEqual(grid.getViewSize([1, 0]), { width: 600, height: 400 });
		assert.deepEqual(view2.size, [600, 200]);
		assert.deepEqual(grid.getViewSize([0, 1]), { width: 600, height: 200 });
		assert.deepEqual(view3.size, [200, 400]);
		assert.deepEqual(grid.getViewSize([1, 1]), { width: 200, height: 400 });
		assert.deepEqual(view4.size, [200, 200]);
		assert.deepEqual(grid.getViewSize([0, 0]), { width: 200, height: 200 });

		const view5 = new TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE);
		grid.addView(view5, 100, [1, 0, 1]);
		assert.deepEqual(view1.size, [600, 300]);
		assert.deepEqual(grid.getViewSize([1, 0, 0]), { width: 600, height: 300 });
		assert.deepEqual(view2.size, [600, 200]);
		assert.deepEqual(grid.getViewSize([0, 1]), { width: 600, height: 200 });
		assert.deepEqual(view3.size, [200, 400]);
		assert.deepEqual(grid.getViewSize([1, 1]), { width: 200, height: 400 });
		assert.deepEqual(view4.size, [200, 200]);
		assert.deepEqual(grid.getViewSize([0, 0]), { width: 200, height: 200 });
		assert.deepEqual(view5.size, [600, 100]);
		assert.deepEqual(grid.getViewSize([1, 0, 1]), { width: 600, height: 100 });
	});
});
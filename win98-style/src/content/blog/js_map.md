---
title: JavaScript 中的 Map 对象
pubDate: 2024-02-07T20:25:10+08:00
updatedDate: 2024-11-03T14:06:40+08:00
---

今天刷 LeetCode 时看到的一个题目:

两数之和: 给定一个整数数组 nums 和一个整数目标值 target, 请你在该数组中找出和为目标值 target 的那两个整数, 并返回它们的数组下标.

一开始我使用了比较方便的写法, 直接写两个for循环, 获取数组的 item 再相加和 target 对比, 非常简单粗暴, 但是这样的延迟很高, 达到了 150ms.

```typescript
function twoSum(nums: number[], target: number): number[] {
	let sub1 = 0,
		sub2 = 0;
	for (let i = 0; i < nums.length; i++) {
		for (let j = 0; j < nums.length; j++) {
			if (i === j) {
				continue;
			}
			if (nums[i] + nums[j] === target) {
				sub1 = i;
				sub2 = j;
			}
		}
	}

	return [sub1, sub2];
}
```

看了一下排行榜前几位的答案, 发现用到了`Map`这个对象, 不过很遗憾, 之前并没有接触过.

打开 MDN 查了一下, 发现这个对象可以用来保存一堆键值, 并使用方法对保存的键值进行查询.

举个栗子

```JavaScript
const contacts = new Map();

// set 方法保存键值
contacts.set("Jessie", { phone: "213-555-1234", address: "123 N 1st Ave" });

// has 方法查询
contacts.has("Jessie"); // true

// get 方法获取值
contacts.get("Hilary"); // undefined

contacts.set("Hilary", { phone: "617-555-4321", address: "321 S 2nd St" });
contacts.get("Jessie"); // {phone: "213-555-1234", address: "123 N 1st Ave"}

// delete 方法删除键值
contacts.delete("Raymond"); // false
contacts.delete("Jessie"); // true
console.log(contacts.size); // 1
```

所以上面的题目答案可以使用`Map`, 对 nums 数组的item和下标进行保存, 再遍历查询是否有能够符合两数之和等于target的键值即可.

```typescript
function twoSum(nums: number[], target: number): number[] {
	const map = new Map();
	const length = nums.length;

	for (let i = 0; i < length; i++) {
		// 如果 has 查询到 target - item === map 中保存的键
		if (map.has(target - nums[i])) {
			// 返回当前item的下标i, 以及通过get方法获取has方法查询到的键值, 返回下标.
			return [i, map.get(target - nums[i])];
		}

		map.set(nums[i], i);
	}
}
```

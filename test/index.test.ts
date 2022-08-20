import { crawl } from "../src";

describe("Crawling Episode", () => {
	test("episodes[0] should return episode object & nextPage should be defined", async () => {
		const { episodes, nextPage } = await crawl(
			"https://www.myrunningman.com/episodes/1"
		);
		const eps = episodes[0];
		expect(eps).toBeDefined();
		expect(eps.title).toBe("#001 - Times Square");
		expect(eps.releaseDate).toBe("2010-07-11");
		expect(eps.link).toBe("https://www.myrunningman.com/ep/1");
		expect(eps.tags).toHaveLength(11);
		expect(eps.guests).toHaveLength(2);
		expect(nextPage).toBeDefined();
	});
	test("episodes[11] should have no gouest", async () => {
		const { episodes } = await crawl("https://www.myrunningman.com/episodes/1");
		const eps = episodes[11];
		expect(eps.guests).toHaveLength(0);
	});

	test("last page should return episode object & nextPage should be undefined", async () => {
		const { episodes, nextPage } = await crawl(
			"https://www.myrunningman.com/episodes/42" //42 page is the latest page at the time of making this, should be replaced in case it's changed
		);
		const eps = episodes[0];
		expect(eps).toBeDefined();
		expect(nextPage).toBeUndefined();
	});
});

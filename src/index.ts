import { fetch } from "undici";
import { load as Cheerio } from "cheerio";
import { existsSync, writeFileSync } from "fs";
import { resolve } from "path";

export interface Episode {
	title: string;
	link: string;
	tags: string[];
	guests: string[];
	releaseDate: string;
}
export interface Page {
	episodes: Episode[];
	nextPage: string | undefined;
}
const BASE_URL = "https://www.myrunningman.com";
export const crawl = async (url: string): Promise<Page> => {
	const episodes: Episode[] = [];
	const response = await fetch(url);
	if (response.status !== 200) throw new Error(response.statusText);
	const html = await response.text();
	const $ = Cheerio(html);
	$('strong > a[href*="/ep/"]').each((i, el) => {
		const epsEl = $(el);
		const title = $(epsEl).text() ?? "";
		const link = $(epsEl).attr("href") ?? "";
		const pTag = $(epsEl).parent().parent();
		const pTag2 = $(pTag).next();
		const spans = pTag2.children();
		const releaseDate = $(spans).first().text().trim() ?? "";
		const pTag4 = $(pTag2).next().next();
		const as = $(pTag4).find("a");
		const guests: string[] = [];
		as.each(function (i, el) {
			const guest = $(this).text().trim() ?? "";
			guests.push(guest);
		});
		const tags: string[] = [];
		const pTag5 = $(pTag4).next();
		const as2 = $(pTag5).find("a");
		as2.each(function (i, el) {
			const tag = $(this).text().trim() ?? "";
			tags.push(tag);
		});

		episodes.push({
			title,
			link: `${BASE_URL}${link}`,
			releaseDate,
			tags,
			guests,
		});
	});
	return { episodes, nextPage: $('a[aria-label="Next"]').attr("href") };
};

const main = async () => {
	// const date = new Date();
	// const fileIdentifier = date.toLocaleDateString().replace(/\//g, "-");
	const filename = `episodes.json`;
	const fileLocation = resolve(...[__dirname, "..", "episodes", filename]);
	if (existsSync(fileLocation)) {
		console.log("filename", filename);
		return;
	}
	let episodes: Episode[] = [];
	let url: string | undefined = "https://www.myrunningman.com/episodes/";
	while (url) {
		if (!url) break;
		if (!url.startsWith(BASE_URL)) url = BASE_URL + url;
		console.log("crawling " + url);

		const data: Page = await crawl(url);
		episodes = [...episodes, ...data.episodes];
		url = data.nextPage;
		console.log(
			`${data.episodes.length} episodes crawled! total episodes : ${episodes.length}`
		);
		writeFileSync(fileLocation, JSON.stringify(episodes, null, 2));
		await new Promise<void>((res) => setTimeout(() => res(), 5000));
	}
};
main();

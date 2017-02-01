'use strict';

const expect = require("chai").expect;
const buildFetchUpdateQuery = require("../lib/query-builder").buildFetchUpdateQuery;

describe("Query Builder", () => {
    const startDate = "01.01.01";

    it("should build query for single specified projects", () => {
        const projectKey = "as";
        const actual = buildFetchUpdateQuery(projectKey, startDate);
        const expected = `project = "${projectKey}" and updatedDate >= "${startDate}" order by updatedDate desc `;
        expect(actual).be.eq(expected);
    });

    it("should build query for array of projects", () => {
        const projectKey = ["AS", "ASQA"];
        const actual = buildFetchUpdateQuery(projectKey, startDate);
        const expected = `project in ("AS", "ASQA") and updatedDate >= "${startDate}" order by updatedDate desc `;
        expect(actual).be.eq(expected);
    });
});
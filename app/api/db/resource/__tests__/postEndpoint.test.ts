import { POST } from "../route";
import AWS from "aws-sdk";
import * as route from "../../route"; // Import the module containing getObject and putObject

jest.mock("uuid", () => ({
  v4: jest.fn(() => "mocked-uuid"),
}));

type RequestLike = {
  json: () => Promise<any>;
};

// Define a custom Response mock with a json method
global.Response = {
  json: (data: any) => ({
    json: () => Promise.resolve(data),
  }),
} as any;

describe("POST endpoint tests", () => {
  const mockRequestData = {
    documentId: "doc-123",
    name: "Test Resource",
    url: "https://example.com",
    text: "Sample text",
    folderName: "Folder1",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Missing fields in request should return error", async () => {
    const incompleteRequestData = { ...mockRequestData };
    delete (incompleteRequestData as Partial<typeof incompleteRequestData>)
      .name;

    const request: RequestLike = {
      json: async () => incompleteRequestData,
    };

    const response = await POST(request as any);
    const responseData = (await response.json()) as any;

    expect(responseData.err).toBe("missing fields");
  });

  test("Folder not in document should be created", async () => {
    const documentWithoutFolder = {
      Item: AWS.DynamoDB.Converter.marshall({
        id: "doc-123",
        folders: {},
      }),
    };

    const getObjectMock = jest.spyOn(route, "getObject");
    getObjectMock.mockImplementation(() =>
      Promise.resolve(documentWithoutFolder),
    );

    const putObjectMock = jest.spyOn(route, "putObject");
    putObjectMock.mockImplementation(() => Promise.resolve({}));

    const request: RequestLike = {
      json: async () => mockRequestData,
    };

    const response = await POST(request as any);
    const responseData = (await response.json()) as any;

    // Assertions
    expect(responseData.folders[mockRequestData.folderName]).toBeDefined();
    expect(
      responseData.folders[mockRequestData.folderName].resources,
    ).toContain("mocked-uuid"); // Verify that the mocked UUID is used
  });
});

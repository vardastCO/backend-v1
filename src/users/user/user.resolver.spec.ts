import { Test, TestingModule } from "@nestjs/testing";
import { UserResolver } from "./user.resolver";
import { UserService } from "./user.service";

describe("UserResolver", () => {
  let resolver: UserResolver;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UserService,
          useValue: {
            findOne: jest
              .fn()
              .mockResolvedValue({ id: "1", name: "Test User" }),
          },
        },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    service = module.get<UserService>(UserService);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
  });
  it("should return a user", async () => {
    const user = await resolver.findOne(1, "");
    expect(user).toEqual({ id: "1", name: "Test User" });
    expect(service.findOne).toHaveBeenCalledWith(1, ""); // Updated to match the actual call
  });
});

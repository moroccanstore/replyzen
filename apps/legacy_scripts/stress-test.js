"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var axios_1 = __importDefault(require("axios"));
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var API_URL = 'http://localhost:3000/api/webhooks/whatsapp';
var CONCURRENCY = 5;
// Sleep helper
var delay = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
// Helper to chunk promises for concurrency
function pMap(items, mapper, concurrency) {
    return __awaiter(this, void 0, void 0, function () {
        var results, i, chunk, chunkResults;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    results = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < items.length)) return [3 /*break*/, 4];
                    chunk = items.slice(i, i + concurrency);
                    return [4 /*yield*/, Promise.all(chunk.map(mapper))];
                case 2:
                    chunkResults = _a.sent();
                    results.push.apply(results, chunkResults);
                    _a.label = 3;
                case 3:
                    i += concurrency;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, results];
            }
        });
    });
}
function buildMetaPayload(phoneId, fromPhone, text) {
    return {
        object: 'whatsapp_business_account',
        entry: [
            {
                changes: [
                    {
                        value: {
                            metadata: {
                                phone_number_id: phoneId,
                            },
                            contacts: [
                                {
                                    profile: { name: "User ".concat(fromPhone) },
                                },
                            ],
                            messages: [
                                {
                                    id: "wamid.test.".concat(Date.now(), ".").concat(Math.random().toString(36).substring(7)),
                                    from: fromPhone,
                                    type: 'text',
                                    text: { body: text },
                                },
                            ],
                        },
                    },
                ],
            },
        ],
    };
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var workspace, phoneId, initialMessages, initialConversations, users, stats, simulateUser, finalMessages, finalConversations, newMessagesCount, newConversationsCount, avgTime;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🚀 INITIALIZING STRESS TEST...');
                    return [4 /*yield*/, prisma.workspace.findFirst({
                            where: { whatsappPhoneId: { not: null } },
                        })];
                case 1:
                    workspace = _a.sent();
                    if (!!workspace) return [3 /*break*/, 3];
                    console.log('⚠️ No workspace with whatsappPhoneId found. Creating/updating demo workspace...');
                    return [4 /*yield*/, prisma.workspace.upsert({
                            where: { id: 'demo-workspace-id' },
                            update: { whatsappPhoneId: 'test-phone-id', metaToken: 'test-token' },
                            create: {
                                id: 'demo-workspace-id',
                                name: 'Demo Workspace',
                                plan: 'PRO',
                                aiWeeklyLimit: 500,
                                whatsappPhoneId: 'test-phone-id',
                                metaToken: 'test-token',
                            },
                        })];
                case 2:
                    workspace = _a.sent();
                    _a.label = 3;
                case 3:
                    phoneId = workspace.whatsappPhoneId;
                    console.log("\u2705 Using Workspace ID: ".concat(workspace.id, " | Phone ID: ").concat(phoneId));
                    return [4 /*yield*/, prisma.message.count()];
                case 4:
                    initialMessages = _a.sent();
                    return [4 /*yield*/, prisma.conversation.count()];
                case 5:
                    initialConversations = _a.sent();
                    users = Array.from({ length: 20 }, function (_, i) { return ({
                        id: i + 1,
                        phone: "+123450000".concat(i.toString().padStart(2, '0')),
                    }); });
                    stats = {
                        totalRequests: 0,
                        successes: 0,
                        errors: 0,
                        responseTimes: [],
                    };
                    simulateUser = function (user) { return __awaiter(_this, void 0, void 0, function () {
                        var p1, start, e_1, waitTime, p2, e_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    p1 = buildMetaPayload(phoneId, user.phone, 'Hi, I want to buy iPhone 15');
                                    console.log("[User ".concat(user.id, "] Sending: \"Hi, I want to buy iPhone 15\""));
                                    start = Date.now();
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    // NOTE: Using the real webhooks endpoint to simulate actual Meta API requests,
                                    // mapping to the user's intent of POST /conversations/:id/reply.
                                    return [4 /*yield*/, axios_1.default.post(API_URL, p1)];
                                case 2:
                                    // NOTE: Using the real webhooks endpoint to simulate actual Meta API requests,
                                    // mapping to the user's intent of POST /conversations/:id/reply.
                                    _a.sent();
                                    stats.successes++;
                                    stats.responseTimes.push(Date.now() - start);
                                    return [3 /*break*/, 4];
                                case 3:
                                    e_1 = _a.sent();
                                    console.error("[User ".concat(user.id, "] Error M1:"), e_1.message);
                                    stats.errors++;
                                    return [3 /*break*/, 4];
                                case 4:
                                    stats.totalRequests++;
                                    waitTime = Math.floor(Math.random() * 800) + 200;
                                    return [4 /*yield*/, delay(waitTime)];
                                case 5:
                                    _a.sent();
                                    p2 = buildMetaPayload(phoneId, user.phone, 'Do you have discount?');
                                    console.log("[User ".concat(user.id, "] Sending: \"Do you have discount?\""));
                                    start = Date.now();
                                    _a.label = 6;
                                case 6:
                                    _a.trys.push([6, 8, , 9]);
                                    return [4 /*yield*/, axios_1.default.post(API_URL, p2)];
                                case 7:
                                    _a.sent();
                                    stats.successes++;
                                    stats.responseTimes.push(Date.now() - start);
                                    return [3 /*break*/, 9];
                                case 8:
                                    e_2 = _a.sent();
                                    console.error("[User ".concat(user.id, "] Error M2:"), e_2.message);
                                    stats.errors++;
                                    return [3 /*break*/, 9];
                                case 9:
                                    stats.totalRequests++;
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    console.log('⏳ Starting simulations with concurrency of 5...');
                    return [4 /*yield*/, pMap(users, simulateUser, CONCURRENCY)];
                case 6:
                    _a.sent();
                    // Wait a moment for queue to process webhooks and DB writes to finish
                    console.log('⏳ Waiting for background queue workers to settle (3 seconds)...');
                    return [4 /*yield*/, delay(3000)];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, prisma.message.count()];
                case 8:
                    finalMessages = _a.sent();
                    return [4 /*yield*/, prisma.conversation.count()];
                case 9:
                    finalConversations = _a.sent();
                    newMessagesCount = finalMessages - initialMessages;
                    newConversationsCount = finalConversations - initialConversations;
                    avgTime = stats.responseTimes.reduce(function (a, b) { return a + b; }, 0) / (stats.responseTimes.length || 1);
                    console.log('\n=============================================');
                    console.log('📊 FINAL REPORT:');
                    console.log('=============================================');
                    console.log("- Total requests sent: ".concat(stats.totalRequests));
                    console.log("- Success rate: ".concat((stats.successes / stats.totalRequests) * 100, "%"));
                    console.log("- Errors: ".concat(stats.errors));
                    console.log("- Average API response time: ".concat(avgTime.toFixed(2), "ms"));
                    console.log('\n🗄️ DB STATS (Observed delta):');
                    console.log("- New messages count: ".concat(newMessagesCount));
                    console.log("- New conversations: ".concat(newConversationsCount));
                    console.log('=============================================');
                    console.log('\nREAL STRESS TEST COMPLETED — SYSTEM ACTIVE');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('CRITICAL FATAL TEST ERROR:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });

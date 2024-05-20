const dictionaries = {
    string: [
        "fuzzString1", "fuzzString2", "fuzzString3", "", " ", "\0", "\n", "\r", "\t",
        "a".repeat(1000), "!@#$%^&*()", "正常な文字列", "1234567890", "x".repeat(10000), "null", "undefined", "NaN", JSON.stringify({ key: "value" }),
        encodeURIComponent("<test>"), decodeURIComponent("%3Ctest%3E")
    ],
    number: [
        0, 1, 999, -1, 3.14, NaN, Infinity, -Infinity,
        Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MAX_VALUE, Number.MIN_VALUE,
        1e100, -1e100, 1e-100, -1e-100
    ],
    boolean: [true, false],
    object: [{}, {key: "value"}, null, [], { complex: { nested: { structure: true } } }],
    function: [() => {}, function() {}, async () => {}, function test() { return "test"; }]
};

function generateRandomString(length) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
}

function generateRandomByteSequence(length) {
    const buffer = new Uint8Array(length);
    crypto.getRandomValues(buffer);
    return buffer;
}

dictionaries.string.push(...Array.from({ length: 100 }, () => generateRandomString(10)));

export { dictionaries, generateRandomByteSequence };

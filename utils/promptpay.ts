/**
 * Builds a Thai PromptPay EMVCo QR payload string from a mobile number or
 * national/tax ID, following the Bank of Thailand PromptPay QR spec (a TLV-
 * encoded EMV QR Code with a CRC16-CCITT checksum). The resulting string is
 * what gets rendered as the QR code image — scanning it opens the target
 * bank app pre-filled with the recipient (and amount, if provided).
 */

function tlv(tag: string, value: string): string {
  return `${tag}${String(value.length).padStart(2, "0")}${value}`;
}

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function formatTarget(id: string): { tag: string; value: string } {
  const digits = id.replace(/[^0-9]/g, "");
  if (digits.length === 13) {
    // National ID or Tax ID
    return { tag: "02", value: digits };
  }
  // Mobile number: strip leading 0, prefix with country code 66, pad to 13.
  const withoutLeadingZero = digits.replace(/^0/, "66");
  return { tag: "01", value: withoutLeadingZero.padStart(13, "0").slice(0, 13) };
}

export function buildPromptPayPayload(promptPayId: string, amount?: number): string {
  const target = formatTarget(promptPayId);
  const merchantInfo = tlv("00", "A000000677010111") + tlv(target.tag, target.value);

  let payload =
    tlv("00", "01") + // Payload Format Indicator
    tlv("01", amount ? "12" : "11") + // Point of Initiation Method (dynamic if amount set)
    tlv("29", merchantInfo) +
    tlv("53", "764") + // Currency: THB
    (amount ? tlv("54", amount.toFixed(2)) : "") +
    tlv("58", "TH");

  payload += "6304"; // CRC tag + length, value appended below
  return payload + crc16(payload);
}

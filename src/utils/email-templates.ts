
const BRAND_PRIMARY = "#6366F1"; 
const BRAND_DARK = "#1E1B4B";
const BRAND_ACCENT = "#A5B4FC";
const DANGER = "#EF4444";
const WARNING = "#F59E0B";
const SUCCESS = "#10B981";
const MUTED_TEXT = "#94A3B8";
const BODY_BG = "#F1F5F9";
const CARD_BG = "#FFFFFF";
const BORDER_COLOR = "#E2E8F0";

const wrap = (content: string, preheader = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Expense Tracker</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BODY_BG};font-family:'Segoe UI',Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;</div>` : ""}

  <!-- Email Wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:${BODY_BG};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                style="background:linear-gradient(135deg,${BRAND_DARK} 0%,${BRAND_PRIMARY} 100%);border-radius:16px 16px 0 0;">
                <tr>
                  <td align="center" style="padding:36px 40px;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:12px 16px;margin-bottom:16px;">
                      <span style="font-size:28px;">💰</span>
                    </div>
                    <h1 style="margin:0;color:#FFFFFF;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Expense Tracker</h1>
                    <p style="margin:6px 0 0;color:${BRAND_ACCENT};font-size:13px;letter-spacing:0.5px;">Smart Financial Management</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background:${CARD_BG};border-radius:0 0 16px 16px;border:1px solid ${BORDER_COLOR};border-top:none;overflow:hidden;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:40px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 0 8px;text-align:center;">
              <p style="margin:0 0 8px;color:${MUTED_TEXT};font-size:12px;line-height:1.6;">
                &copy; ${new Date().getFullYear()} Expense Tracker. All rights reserved.
              </p>
              <p style="margin:0;color:${MUTED_TEXT};font-size:11px;">
                This is an automated message &mdash; please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;



const greeting = (name?: string) =>
  `<p style="margin:0 0 8px;color:#475569;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Hello${name ? ", " + name : ""}!</p>`;

const divider = `<hr style="border:none;border-top:1px solid ${BORDER_COLOR};margin:28px 0;" />`;

const otpBox = (code: string, color = BRAND_PRIMARY) => `
  <div style="text-align:center;margin:32px 0;">
    <p style="margin:0 0 12px;color:#64748B;font-size:13px;">Your one-time verification code is</p>
    <div style="display:inline-block;background:${color}18;border:2px dashed ${color};border-radius:12px;padding:16px 40px;">
      <span style="font-size:38px;font-weight:800;letter-spacing:10px;color:${color};font-family:monospace;">${code}</span>
    </div>
    <p style="margin:12px 0 0;color:#94A3B8;font-size:12px;">Expires in <strong>10 minutes</strong></p>
  </div>`;

const alertBox = (
  icon: string,
  text: string,
  bgColor: string,
  textColor: string,
) => `
  <div style="background:${bgColor}18;border-left:4px solid ${bgColor};border-radius:0 8px 8px 0;padding:14px 18px;margin:20px 0;">
    <p style="margin:0;color:${textColor};font-size:14px;line-height:1.5;">${icon} ${text}</p>
  </div>`;

const infoRow = (label: string, value: string) => `
  <tr>
    <td style="padding:10px 16px;border-bottom:1px solid ${BORDER_COLOR};color:#94A3B8;font-size:13px;">${label}</td>
    <td style="padding:10px 16px;border-bottom:1px solid ${BORDER_COLOR};text-align:right;color:#1E293B;font-size:13px;font-weight:600;">${value}</td>
  </tr>`;

const ctaButton = (text: string, href = "#") => `
  <div style="text-align:center;margin:28px 0 0;">
    <a href="${href}" style="display:inline-block;background:linear-gradient(135deg,${BRAND_PRIMARY},${BRAND_DARK});color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
      ${text}
    </a>
  </div>`;


export const emailVerificationTemplate = (otpCode: string, userName?: string) =>
  wrap(
    `
    ${greeting(userName)}
    <h2 style="margin:4px 0 16px;color:#0F172A;font-size:22px;font-weight:700;">Verify your email address</h2>
    <p style="margin:0 0 8px;color:#475569;font-size:15px;line-height:1.7;">
      Welcome to <strong>Expense Tracker</strong>! We're excited to have you on board.
      To activate your account and start managing your finances smarter, please use the code below.
    </p>
    ${otpBox(otpCode, BRAND_PRIMARY)}
    ${alertBox("🔒", "Never share this code with anyone. Our team will never ask for it.", "#6366F1", "#4338CA")}
    ${divider}
    <p style="margin:0;color:#94A3B8;font-size:13px;line-height:1.6;">
      If you didn't create an account, you can safely ignore this email. No action is required.
    </p>`,
    `Your Expense Tracker verification code is ${otpCode}`,
  );


export const resendOtpTemplate = (otpCode: string, userName?: string) =>
  wrap(
    `
    ${greeting(userName)}
    <h2 style="margin:4px 0 16px;color:#0F172A;font-size:22px;font-weight:700;">Here's your new verification code</h2>
    <p style="margin:0 0 8px;color:#475569;font-size:15px;line-height:1.7;">
      You requested a new one-time code to verify your <strong>Expense Tracker</strong> account.
      Use the code below &mdash; it is valid for the next 10 minutes.
    </p>
    ${otpBox(otpCode, BRAND_PRIMARY)}
    ${alertBox("⚠️", "Your previous code has been invalidated. Only this new code will work.", WARNING, "#92400E")}
    ${divider}
    <p style="margin:0;color:#94A3B8;font-size:13px;line-height:1.6;">
      If you didn't request this, please contact our support team immediately.
    </p>`,
    `Your new Expense Tracker verification code is ${otpCode}`,
  );


export const forgotPasswordTemplate = (otpCode: string, userName?: string) =>
  wrap(
    `
    ${greeting(userName)}
    <h2 style="margin:4px 0 16px;color:#0F172A;font-size:22px;font-weight:700;">Reset your password</h2>
    <p style="margin:0 0 8px;color:#475569;font-size:15px;line-height:1.7;">
      We received a request to reset the password associated with your <strong>Expense Tracker</strong> account.
      Enter the code below on the password reset page.
    </p>
    ${otpBox(otpCode, DANGER)}
    ${alertBox("🚨", "If you did not request this reset, your account may be at risk. Secure your account immediately.", DANGER, "#991B1B")}
    ${divider}
    <p style="margin:0;color:#94A3B8;font-size:13px;line-height:1.6;">
      This code is valid for <strong>10 minutes</strong> and can only be used once.
      After it expires, you will need to request a new one.
    </p>`,
    `Your Expense Tracker password reset code is ${otpCode}`,
  );


export const newLoginAlertTemplate = (details: {
  deviceName: string;
  browser: string;
  ip: string;
  time: string;
  userName?: string;
}) =>
  wrap(
    `
    ${greeting(details.userName)}
    <h2 style="margin:4px 0 16px;color:#0F172A;font-size:22px;font-weight:700;">New sign-in detected</h2>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7;">
      We noticed a new sign-in to your <strong>Expense Tracker</strong> account from a device we don't recognise.
      Here are the details of this login:
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
      style="background:#F8FAFC;border:1px solid ${BORDER_COLOR};border-radius:10px;overflow:hidden;">
      <tbody>
        ${infoRow("📱&nbsp; Device", details.deviceName)}
        ${infoRow("🌐&nbsp; Browser", details.browser)}
        ${infoRow("📍&nbsp; IP Address", details.ip)}
        ${infoRow("🕐&nbsp; Time", details.time)}
      </tbody>
    </table>

    ${alertBox("✅", "If this was you signing in, no further action is needed — you're all set.", SUCCESS, "#065F46")}
    ${alertBox("🚨", "If you don't recognise this activity, secure your account immediately by resetting your password.", DANGER, "#991B1B")}
    ${divider}
    <p style="margin:0;color:#94A3B8;font-size:13px;line-height:1.6;">
      To protect your account, we recommend using a strong, unique password and enabling two-factor authentication in your security settings.
    </p>`,
    "A new sign-in was detected on your Expense Tracker account.",
  );


export const reminderTemplate = (
  title: string,
  message: string,
  opts: {
    icon?: string;
    accentColor?: string;
    userName?: string;
    ctaText?: string;
    ctaUrl?: string;
  } = {},
) => {
  const {
    icon = "🔔",
    accentColor = BRAND_PRIMARY,
    userName,
    ctaText,
    ctaUrl,
  } = opts;

  return wrap(
    `
    ${greeting(userName)}
    <h2 style="margin:4px 0 16px;color:#0F172A;font-size:22px;font-weight:700;">${icon} ${title}</h2>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7;">${message}</p>

    <div style="background:${accentColor}12;border:1px solid ${accentColor}30;border-radius:10px;padding:18px 24px;">
      <p style="margin:0;color:#334155;font-size:14px;line-height:1.7;">
        💡 <strong>Stay on top of your finances</strong> &mdash; open your Expense Tracker dashboard to review and take action.
      </p>
    </div>

    ${ctaText ? ctaButton(ctaText, ctaUrl) : ""}
    ${divider}
    <p style="margin:0;color:#94A3B8;font-size:13px;line-height:1.6;">
      You're receiving this email because you have automated reminders enabled on your account.
      You can manage your notification preferences from your profile settings.
    </p>`,
    message,
  );
};


export const reminderColors: Record<string, string> = {
  bill_due: WARNING,
  bill_overdue: DANGER,
  emi_due: WARNING,
  budget_alert: WARNING,
  budget_exceeded: DANGER,
  default: BRAND_PRIMARY,
};

export const reminderIcons: Record<string, string> = {
  bill_due: "🧾",
  bill_overdue: "🚨",
  emi_due: "💳",
  budget_alert: "⚠️",
  budget_exceeded: "🔴",
  default: "🔔",
};

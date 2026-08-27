/**
 * Message templates and delivery.
 *
 * The templates are separated from the sending code so that the weekly message
 * and the end-of-season message can sit side by side, selected by name, rather
 * than one of them being commented out while the other is live.
 */

const UNSUBSCRIBE_SUBJECT_ = 'Hekim%20Kohortundan%20Ayr%C4%B1lma%20Talebi';

function frame_(cfg, inner, footer) {
  return '' +
    '<div style="font-family: \'Times New Roman\', Times, serif; max-width: 600px; margin: 0 auto;' +
    ' border: 1px solid #dddddd; border-radius: 8px; background-color: #ffffff;">' +
      '<div style="text-align: center; padding: 30px 20px 10px 20px;">' +
        '<h2 style="margin: 0; color: #7f6000;">SALGINTR Hekim Kohortu</h2>' +
      '</div>' +
      inner +
      '<div style="padding: 20px 40px 30px 40px; color: #888888; font-size: 12px; text-align: center;">' +
        '<p style="margin: 0;">İyi çalışmalar dileriz,<br>' +
        '<strong style="color: #000000;">SALGINTR Araştırma Ekibi</strong></p>' +
        footer +
      '</div>' +
    '</div>';
}

function unsubscribeFooter_(cfg) {
  return '<br><p style="margin: 0;">Bu e-postaları almak istemiyorsanız, ' +
    '<a href="mailto:' + cfg.adminEmail + '?subject=' + UNSUBSCRIBE_SUBJECT_ +
    '" style="color: #7f6000;">buraya tıklayarak</a> bize bildirebilirsiniz.</p>';
}

/** The weekly surveillance invitation, carrying the participant's own link. */
function weeklyTemplate_(cfg, link, isFirst) {
  const body =
    '<div style="padding: 20px 40px; color: #000000; line-height: 1.6;">' +
      '<p>Değerli meslektaşımız,</p>' +
      '<p>Geçtiğimiz haftaya ait bulgular, tablolar ve görseller sitemize eklenmiştir.</p>' +
      '<p>Size özel oluşturulmuş sürveyans formuna aşağıdaki linkten ulaşabilirsiniz. ' +
      'Salı günü 23:59\'a kadar yanıt verebilirsiniz.</p>' +
    '</div>' +
    '<div style="text-align: center; padding: 20px 40px;">' +
      '<a href="' + link + '" target="_blank" style="background-color: #7f6000; color: #ffffff;' +
      ' padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;' +
      ' font-weight: bold;">SÜRVEYANS FORMU</a>' +
    '</div>';

  return {
    subject: isFirst
      ? 'SALGINTR - Araştırmamıza Hoş Geldiniz ve İlk Haftalık Sürveyans Formunuz'
      : 'SALGINTR - Haftalık Sürveyans Formunuz',
    html: frame_(cfg, body, unsubscribeFooter_(cfg)),
    text: 'Değerli meslektaşımız,\n\n' +
      'Geçtiğimiz haftaya ait bulgular, tablolar ve görseller sitemize eklenmiştir. ' +
      'Size özel oluşturulmuş sürveyans formuna aşağıdaki linkten ulaşabilirsiniz:\n' +
      link + '\n\nSalı günü 23:59\'a kadar yanıt verebilirsiniz.\n\n' +
      'İyi çalışmalar dileriz,\nSALGINTR Araştırma Ekibi\n\n' +
      'Bu e-postaları almak istemiyorsanız ' + cfg.adminEmail + ' adresine bildirebilirsiniz.'
  };
}

/** The end-of-season message, sent once when data collection closes. */
function closingTemplate_(cfg) {
  const body =
    '<div style="padding: 20px 40px; color: #000000; line-height: 1.6;">' +
      '<p>Değerli meslektaşımız,</p>' +
      '<p>SALGINTR hekim kohortu projemizin 2025-2026 influenza sezonu için ' +
      '<strong>veri toplama dönemi tamamlanmıştır</strong>. Bugüne kadarki değerli ' +
      'katkılarınız ve ayırdığınız zaman için içtenlikle teşekkür ederiz.</p>' +
      '<p>Veri temizliği ve analiz işlemlerinin tamamlanmasının ardından, projemize ait ' +
      'özet bulgular sitemizde paylaşılacaktır. Sürece dair güncel duyuruları ve sonuçları ' +
      '<a href="https://www.salgin.com.tr" style="color: #7f6000; font-weight: bold;">' +
      'www.salgin.com.tr</a> adresinden takip edebilirsiniz.</p>' +
      '<p>2026-2027 influenza sezonu için, Eylül ayının son haftasında, çok daha iyi bir ' +
      'altyapı ve daha geniş katılımlı yeni bir projeyle sizlerle tekrar görüşmek dileğiyle.</p>' +
    '</div>';

  return {
    subject: 'SALGINTR - Veri Toplama Dönemi Tamamlandı / Teşekkürler',
    html: frame_(cfg, body, unsubscribeFooter_(cfg)),
    text: 'Değerli meslektaşımız,\n\n' +
      'SALGINTR hekim kohortu projemizin 2025-2026 influenza sezonu için veri toplama ' +
      'dönemi tamamlanmıştır. Bugüne kadarki değerli katkılarınız ve ayırdığınız zaman ' +
      'için içtenlikle teşekkür ederiz.\n\n' +
      'Veri temizliği ve analiz işlemlerinin tamamlanmasının ardından, projemize ait özet ' +
      'bulgular sitemizde paylaşılacaktır. Sürece dair güncel duyuruları ve sonuçları ' +
      'www.salgin.com.tr adresinden takip edebilirsiniz.\n\n' +
      'Eylül ayının son haftasında, çok daha iyi bir altyapı ve daha geniş katılımlı yeni ' +
      'bir projeyle sizlerle tekrar görüşmek dileğiyle.\n\n' +
      'İyi çalışmalar dileriz,\nSALGINTR Araştırma Ekibi'
  };
}

/**
 * Delivers one message and reports the outcome. The caller decides what to
 * record; this function touches no cells, so that a batch run can write its
 * results once rather than row by row.
 */
function sendMessage_(cfg, address, message) {
  if (cfg.debugMode) {
    return { ok: true, simulated: true };
  }
  try {
    GmailApp.sendEmail(address, message.subject, message.text, {
      htmlBody: message.html,
      name: 'SALGINTR Araştırma Ekibi'
    });
    return { ok: true, simulated: false };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err).slice(0, 200) };
  }
}

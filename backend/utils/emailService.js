import nodemailer from 'nodemailer';

export const envoyerEmailActivation = async (email, prenom, codeActivation) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false 
        }
    });

    const mailOptions = {
        from: `"Heracles 🏆" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🏆 Activation de votre compte Heracles',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.05); color: #333333;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <h1 style="color: #1e3a8a; margin: 0; font-size: 26px; font-weight: 700;">HERACLES</h1>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Plateforme d'analyse & de suivi de progression sportive</p>
                </div>
                <hr style="border: 0; border-top: 1px solid #f3f4f6; margin-bottom: 25px;">
                <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
                    Bonjour <strong>${prenom}</strong>,
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
                    Merci de rejoindre l'aventure Heracles ! Pour valider ton inscription et sécuriser ton accès, merci de saisir le code de confirmation à 6 chiffres ci-dessous sur l'application :
                </p>
                <div style="text-align: center; margin: 35px 0;">
                    <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb; background-color: #eff6ff; padding: 12px 35px; border-radius: 8px; border: 1px dashed #bfdbfe;">
                        ${codeActivation}
                    </span>
                </div>
                <p style="font-size: 13px; line-height: 1.5; color: #9ca3af; text-align: center; margin-bottom: 25px;">
                    Ce code est temporaire et confidentiel. Si tu n'es pas à l'origine de cette demande, tu peux ignorer cet e-mail en toute sécurité.
                </p>
                <hr style="border: 0; border-top: 1px solid #f3f4f6; margin-top: 25px; margin-bottom: 20px;">
                <div style="text-align: center; font-size: 12px; color: #9ca3af;">
                    <p style="margin: 0;">L'équipe Heracles Dev & Performance</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✉️ Email d'activation envoyé avec succès à : ${email}`);
    } catch (error) {
        console.error(`Erreur Nodemailer lors de l'envoi à ${email} :`, error);
        throw new Error("Impossible d'envoyer l'e-mail de confirmation. Veuillez vérifier votre adresse e-mail.");
    }
};

export const envoyerMotDePasseTemporaire = async (email, mdpTemporaire) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false 
        }
    });

    const mailOptions = {
        from: `"Heracles" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Réinitialisation de votre mot de passe Heracles',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.05); color: #333333;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <h1 style="color: #1e3a8a; margin: 0; font-size: 26px; font-weight: 700;">HERACLES</h1>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Nouveau mot de passe temporaire</p>
                </div>
                <hr style="border: 0; border-top: 1px solid #f3f4f6; margin-bottom: 25px;">
                <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
                    Bonjour,
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
                    Une demande de réinitialisation de mot de passe a été effectuée pour votre compte. Voici votre mot de passe temporaire pour vous connecter :
                </p>
                <div style="text-align: center; margin: 35px 0;">
                    <span style="display: inline-block; font-size: 22px; font-weight: bold; color: #1e3a8a; background-color: #f3f4f6; padding: 12px 35px; border-radius: 8px; border: 1px solid #e5e7eb; letter-spacing: 1px;">
                        ${mdpTemporaire}
                    </span>
                </div>
                <p style="font-size: 13px; line-height: 1.5; color: #4b5563; font-weight: 600; text-align: center; margin-bottom: 25px;">
                    Pour des raisons de sécurité, modifiez ce mot de passe depuis votre profil dès votre connexion.
                </p>
                <hr style="border: 0; border-top: 1px solid #f3f4f6; margin-top: 25px; margin-bottom: 20px;">
                <div style="text-align: center; font-size: 12px; color: #9ca3af;">
                    <p style="margin: 0;">L'équipe Heracles Dev</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`Erreur d'envoi de mail de réinitialisation à ${email} :`, error);
        throw new Error("Impossible d'envoyer l'e-mail de réinitialisation.");
    }
};

export const envoyerCodeChangementEmail = async (email, code, type) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false 
        }
    });

    const mailOptions = {
        from: `"Heracles" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Changement d'email - Validation de la ${type} adresse`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #1e3a8a; text-align: center;">HERACLES</h2>
                <p>Bonjour,</p>
                <p>Ceci est le code de validation requis pour la <strong>${type} adresse email</strong> dans le cadre de votre procédure de modification de compte :</p>
                <div style="text-align: center; margin: 25px 0;">
                    <span style="font-size: 24px; font-weight: bold; color: #2563eb; background-color: #f3f4f6; padding: 10px 20px; border-radius: 6px; letter-spacing: 2px;">
                        ${code}
                    </span>
                </div>
                <p style="font-size: 12px; color: #6b7280;">Ce code est valide pendant 10 minutes. Si vous n'êtes pas à l'origine de cette demande, sécurisez immédiatement votre mot de passe.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`Erreur d'envoi du code changement email à ${email} :`, error);
        throw new Error("Échec de l'envoi des e-mails de vérification.");
    }
};
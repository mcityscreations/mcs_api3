<?php
if (!defined('_PS_VERSION_')) {
    exit;
}

class GibertSync extends Module
{
    public function __construct()
    {
        $this->name = 'gibertsync'; // Nom du module
        $this->tab = 'front_office_features';
        $this->version = '1.0.0';
        $this->author = 'Votre Nom';
        $this->need_instance = 0;
        $this->ps_versions_compliancy = [
            'min' => '8.0',
            'max' => _PS_VERSION_,
        ];
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->l('Synchronisation ERP Gibert');
        $this->description = $this->l('Envoie les nouvelles commandes à l\'API NestJS pour la synchronisation du stock.');

        // Stocker la clé secrète dans la configuration de PrestaShop
        $this->confirmUninstall = $this->l('Êtes-vous sûr de vouloir désinstaller ?');
    }

    // --- Installation et Hooks ---

    public function install()
    {
        if (!parent::install() ||
            !$this->registerHook('actionObjectOrderAddAfter') || // Hook pour la création de commande
            !Configuration::updateValue('GIBERTSYNC_API_URL', 'https://api.monsite.com/prestashop/webhook/order-sold') ||
            !Configuration::updateValue('GIBERTSYNC_SECRET_KEY', 'MaSuperCleSecreteDe32Caractères') // CLÉ À REMPLACER
        ) {
            return false;
        }
        return true;
    }

    public function uninstall()
    {
        if (!parent::uninstall() ||
            !Configuration::deleteByName('GIBERTSYNC_API_URL') ||
            !Configuration::deleteByName('GIBERTSYNC_SECRET_KEY')
        ) {
            return false;
        }
        return true;
    }

    // --- La Logique du Webhook ---

    public function hookActionObjectOrderAddAfter($params)
    {
        /** @var Order $order */
        $order = $params['object'];
        $webhookUrl = Configuration::get('GIBERTSYNC_API_URL');
        $secretKey = Configuration::get('GIBERTSYNC_SECRET_KEY');

        if (!$webhookUrl || !$secretKey) {
            // Loguer une erreur si la configuration est manquante
            return;
        }

        // On ne traite que les produits pour simplifier :
        foreach ($order->getProducts() as $product) {
            $data = [
                'id_order' => (int)$order->id,
                'id_product' => (int)$product['product_id'],
                'quantity' => (int)$product['product_quantity'],
                // Vous pouvez ajouter d'autres champs si nécessaire
            ];

            // Envoi de la requête CURL à NestJS
            $ch = curl_init($webhookUrl);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                'Content-Type: application/json',
                // Ajout de l'en-tête de sécurité
                'X-Prestashop-Secret: ' . $secretKey,
            ));
            
            $result = curl_exec($ch);
            $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            
            // Si le code n'est pas 200/201, il y a un problème de connexion ou de sécurité
            if ($httpcode !== 200 && $httpcode !== 201) {
                // IMPORTANT: Loguer l'erreur dans un fichier ou dans PrestaShop pour le debug
                error_log('Erreur Webhook NestJS. Code: ' . $httpcode . ', Réponse: ' . $result);
            }
            
            curl_close($ch);
        }
    }
}
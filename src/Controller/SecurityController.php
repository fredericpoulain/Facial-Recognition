<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Random\RandomException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class SecurityController extends AbstractController
{
    //Seuil : plus la valeur est basse, plus la reconnaissance sera restrictive.
    const THRESHOLD = 0.43;
    #[Route(path: '/connexion', name: 'app_login')]
    public function login(AuthenticationUtils $authenticationUtils): Response
    {
         if ($this->getUser()) {
             return $this->redirectToRoute('app_home');
         }

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();
        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('security/login.html.twig', ['last_username' => $lastUsername, 'error' => $error]);
    }

    #[Route(path: '/logout', name: 'app_logout')]
    public function logout(): void
    {
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }

    #[Route(path: '/email-verified', name: 'app_emailVerified')]
    public function emailVerified(UserRepository $userRepository, Request $request): Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('app_home');
        }
        $email = $request->get('email');
        $user = $userRepository->findBy(['email' => $email]);
        if($user){
            return $this->json([
                'isSuccessful' => true,
                'message' => "Utilisateur trouvé",
                'email' => $email
            ]);
        }
        return $this->json([
            'isSuccessful' => false,
            'message' => "Identifiants incorrects"
        ]);
    }

    /**
     * @throws RandomException
     */
    #[Route(path: '/face-recognition', name: 'app_faceRecognition')]
    public function faceRecognition(Request $request, UserRepository $userRepository): Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('app_home');
        }
        // On récupère le nom d'utilisateur et les caractéristiques du visage envoyés par la requête Ajax

        $email = $request->request->get('email');
        $dataFaceApi = $request->request->get('dataFaceApi');

        // On vérifie que les paramètres ne sont pas vides
        if (empty($email) || empty($dataFaceApi)) {
            return $this->json([
                'isSuccessful' => false,
                'message' => 'Données manquantes.'
            ]);
        }

        // On convertit la chaîne de caractères en tableau de nombres flottants
        $dataFaceApi = explode(',', $dataFaceApi);

        // On cherche l'utilisateur correspondant au nom d'utilisateur dans la base de données
        $user = $userRepository->findOneBy(['email' => $email]);
//        dd($user);
        // On vérifie que l'utilisateur existe
        if (!$user) {
            return $this->json([
                'isSuccessful' => false,
                'message' => 'Utilisateur introuvable.'
            ]);
        }

        // On récupère les caractéristiques du visage stockées dans la base de données
        $dataFaceApiDB = $user->getDataFaceApi();

        // On vérifie que les caractéristiques du visage existent
        if (!$dataFaceApiDB) {
            return $this->json([
                'isSuccessful' => false,
                'message' => 'Caractéristiques du visage introuvables.'
            ]);
        }

        // On convertit la chaîne de caractères en tableau de nombres flottants
        $dataFaceApiDB = explode(',', $dataFaceApiDB);

        // On calcule la distance euclidienne entre les deux tableaux de caractéristiques du visage
        $distance = $this->euclideanDistance($dataFaceApi, $dataFaceApiDB);


        // On définit un seuil de similarité


        // On vérifie si la distance est inférieure au seuil
        if ($distance <= self::THRESHOLD) {
            // on Génère un token aléatoire et on le stocke dans la session
            $tokenFaceRecognition = bin2hex(random_bytes(32));
            $request->getSession()->set('tokenFaceRecognition', $tokenFaceRecognition);
            // On renvoie une réponse positive
            return $this->json([
                'isSuccessful' => true,
                'tokenFaceRecognition' => $tokenFaceRecognition,
                'message' => 'Visage identifié avec succès'
            ]);
        } else {
            // On renvoie une réponse négative
            return $this->json([
                'isSuccessful' => false,
                'message' => 'Visage non reconnu.'
            ]);
        }
    }

    // Calcule la distance euclidienne entre deux tableaux de nombres
    private function euclideanDistance(array $dataFaceApi, array $dataFaceApiDB): float
    {

        // On soustrait chaque élément de $dataFaceApi par l'élément correspondant de $dataFaceApiDB, et on élève le résultat au carré
        $diffs = array_map(fn($x, $y) => pow($x - $y, 2), $dataFaceApi, $dataFaceApiDB);
        // On calcule la somme des éléments du tableau $diffs, et on en prend la racine carrée
        return sqrt(array_sum($diffs));

//        $sum = 0;
//        for ($i = 0; $i < count($dataFaceApi); $i++) {
//            $sum += pow($dataFaceApi[$i] - $dataFaceApiDB[$i], 2);
//        }
//        return sqrt($sum);
    }
}

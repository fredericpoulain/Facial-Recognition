<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\RegistrationFormType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class RegistrationController extends AbstractController
{
    #[Route('/inscription', name: 'app_register')]
    public function register(Request $request, UserPasswordHasherInterface $userPasswordHasher, EntityManagerInterface $entityManager): Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('app_home');
        }
        $user = new User();
        $form = $this->createForm(RegistrationFormType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            if ($form->isValid()){
                // encode the plain password
                $user->setPassword(
                    $userPasswordHasher->hashPassword(
                        $user,
                        $form->get('plainPassword')->getData()
                    )
                );
                $entityManager->persist($user);
                $entityManager->flush();
                return $this->json([
                    'isSuccessful' => true,
                    'message' => "Inscription réalisée avec succès"
                ]);
            }
            // Créer un tableau pour stocker les erreurs
            $errors = [];
            // Récupérer la liste des erreurs du formulaire
            $formErrors = $form->getErrors(true);
            // Parcourir la liste des erreurs
            foreach ($formErrors as $error) {
                // Ajouter le message d'erreur dans le tableau
                $errors[] =  ' '.$error->getMessage() . ' ';
            }
            return $this->json([
                'isSuccessful' => false,
                'message' => "Inscription échouée !",
                'errors' => $errors
            ]);
        }

        return $this->render('registration/register.html.twig', [
            'registrationForm' => $form->createView(),
        ]);
    }
}

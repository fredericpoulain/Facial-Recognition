<?php

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\IsTrue;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Regex;
use Symfony\Component\Validator\Constraints\Type;

class RegistrationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('email', EmailType::class, [
                'constraints' => [
                    new NotBlank([
                        'message' => 'Vous devez indiquer une adresse email.',
                    ]),
                    new Email([
                        'mode' => 'strict',
                        'message' => 'L\'adresse email n\'est pas valide.',
                    ]),
                ]
            ])
            ->add('userName', TextType::class, [
                'label' => 'Pseudo *',
                'attr' => [
                    'class' => 'userName',
                    'placeholder' => "Votre pseudo"
                ],
                'constraints' => [
                    new NotBlank([
                        'message' => 'Vous devez indiquer un pseudo.',
                    ])
                ]
            ])
            ->add('agreeTerms', CheckboxType::class, [
                'mapped' => false,
                'label' => "Accepter les conditions",
                'attr' => [
                    'class' => 'agreeTerms'
                ],
                'constraints' => [
                    new IsTrue([
                        'message' => 'Vous devez accepter les conditions.',
                    ]),
                ],
            ])
            ->add('plainPassword', PasswordType::class, [
                'mapped' => false,
                'attr' => [
                    'autocomplete' => 'new-password',
                    'class' => 'password',
                ],
                'constraints' => [
                    new NotBlank([
                        'message' => 'Veuillez entrer un mot de passe',
                    ]),
                    new Length([
                        'min' => 8,
                        'minMessage' => 'Votre mot de passe ne peut pas être inférieur à {{ limit }} caractères.',
                        'max' => 128,
                        'maxMessage' => 'Votre mot de passe ne peut pas être supérieur à {{ limit }} caractères.',
                    ]),
                ],
            ])->add('dataFaceApi', HiddenType::class, [
                'attr' => [
                    'class' => 'dataFaceApi',
                ],
                'constraints' => [
                    new NotBlank([
                        'message' => 'dataFaceApi vide...',
                    ]),
                    new Type([
                        'type' => 'string',
                        'message' => 'dataFaceApi doit être une chaîne de caractères.',
                    ]),
                    new Regex([
                        'pattern' => '/^(-?\\d+(\\.\\d+)?,){127}-?\\d+(\\.\\d+)?$/',
                        'message' => 'dataFaceApi doit respecter le format attendu.',
                    ]),
//                    new Length([
//                        'min' => 128,
//                        'max' => 128,
//                        'exactMessage' => 'dataFaceApi doit contenir 128 nombres flottants.',
//                    ]),
                ]
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
        ]);
    }
}

<?php

namespace App\Filament\Pages\Auth;

use Filament\Auth\Pages\Login as BaseLogin;
use Filament\Schemas\Components\Component;
use Filament\Forms\Components\TextInput;

class Login extends BaseLogin
{
    public function getHeading(): string
    {
        return 'DondeMorales Admin';
    }

    public function getSubHeading(): ?string
    {
        return 'Gestión de catálogo, ventas y promociones';
    }

    protected function getEmailFormComponent(): Component
    {
        return TextInput::make('email')
            ->label('Usuario')
            ->required()
            ->autocomplete('username')
            ->autofocus()
            ->extraInputAttributes(['tabindex' => 1]);
    }

    protected function getCredentialsFromFormData(array $data): array
    {
        $login = trim((string) ($data['email'] ?? ''));

        $email = match (true) {
            $login === 'admin' => 'admin@admin.com',
            str_contains($login, '@') => $login,
            default => $login . '@admin.com',
        };

        return [
            'email' => $email,
            'password' => $data['password'],
        ];
    }
}

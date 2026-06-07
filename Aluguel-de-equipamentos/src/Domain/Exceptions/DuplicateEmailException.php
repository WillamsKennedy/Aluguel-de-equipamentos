<?php

declare(strict_types=1);

namespace Rental\Domain\Exceptions;

use RuntimeException;

final class DuplicateEmailException extends RuntimeException
{
    public function __construct(string $email)
    {
        parent::__construct("E-mail já cadastrado no sistema: '{$email}'");
    }
}

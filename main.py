import pygame
import random
import asyncio

pygame.init()

WIDTH = 500
HEIGHT = 700

screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Flappy Bird Web")

clock = pygame.time.Clock()

# Colors
SKY = (135, 206, 235)
WHITE = (255, 255, 255)
GREEN = (0, 200, 0)
DARK_GREEN = (0, 150, 0)
YELLOW = (255, 255, 0)
BLACK = (0, 0, 0)
BROWN = (139, 69, 19)
ORANGE = (255, 165, 0)

# Fonts
title_font = pygame.font.SysFont("Arial", 55, bold=True)
font = pygame.font.SysFont("Arial", 40)
small_font = pygame.font.SysFont("Arial", 25)

# Bird
bird_x = 100
bird_y = 300
bird_radius = 20

bird_velocity = 0
gravity = 0.5
jump_power = -9

# Pipes
pipe_width = 80
pipe_gap = 180
pipe_speed = 4

pipes = []

# Ground
ground_height = 80

# Score
score = 0
high_score = 0

# Clouds
clouds = []

for i in range(5):
    clouds.append([
        random.randint(0, WIDTH),
        random.randint(20, 250)
    ])

# Game states
game_started = False
game_over = False


def create_pipe():

    pipe_height = random.randint(120, 450)

    top_pipe = pygame.Rect(
        WIDTH,
        0,
        pipe_width,
        pipe_height
    )

    bottom_pipe = pygame.Rect(
        WIDTH,
        pipe_height + pipe_gap,
        pipe_width,
        HEIGHT - pipe_height - pipe_gap - ground_height
    )

    return top_pipe, bottom_pipe


def draw_cloud(x, y):

    pygame.draw.circle(screen, WHITE, (x, y), 20)
    pygame.draw.circle(screen, WHITE, (x + 20, y), 25)
    pygame.draw.circle(screen, WHITE, (x + 40, y), 20)

    pygame.draw.rect(
        screen,
        WHITE,
        (x, y, 40, 20)
    )


def draw_bird(x, y):

    pygame.draw.circle(
        screen,
        YELLOW,
        (x, int(y)),
        bird_radius
    )

    pygame.draw.circle(
        screen,
        WHITE,
        (x + 8, int(y - 5)),
        5
    )

    pygame.draw.circle(
        screen,
        BLACK,
        (x + 8, int(y - 5)),
        2
    )

    pygame.draw.polygon(
        screen,
        ORANGE,
        [
            (x + 18, y),
            (x + 30, y - 5),
            (x + 30, y + 5)
        ]
    )


pipes.append(create_pipe())


async def main():

    global bird_y
    global bird_velocity
    global pipes
    global score
    global high_score
    global game_started
    global game_over
    global pipe_speed

    running = True

    while running:

        clock.tick(60)

        screen.fill(SKY)

        # Clouds
        for cloud in clouds:

            cloud[0] -= 1

            if cloud[0] < -60:
                cloud[0] = WIDTH + 50

            draw_cloud(cloud[0], cloud[1])

        # Events
        for event in pygame.event.get():

            if event.type == pygame.QUIT:
                running = False

            if event.type == pygame.KEYDOWN:

                if event.key == pygame.K_SPACE:

                    if not game_started:
                        game_started = True

                    if not game_over:
                        bird_velocity = jump_power

                if event.key == pygame.K_r and game_over:

                    bird_y = 300
                    bird_velocity = 0

                    pipes = [create_pipe()]

                    score = 0
                    pipe_speed = 4

                    game_started = False
                    game_over = False

        # Start screen
        if not game_started and not game_over:

            title = title_font.render(
                "FLAPPY BIRD",
                True,
                WHITE
            )

            text = small_font.render(
                "Press SPACE to Start",
                True,
                WHITE
            )

            screen.blit(title, (60, 220))
            screen.blit(text, (120, 320))

            draw_bird(bird_x, bird_y)

            pygame.display.update()

            await asyncio.sleep(0)

            continue

        # Game over screen
        if game_over:

            over = title_font.render(
                "GAME OVER",
                True,
                WHITE
            )

            score_text = font.render(
                f"Score : {score}",
                True,
                WHITE
            )

            high_text = font.render(
                f"High Score : {high_score}",
                True,
                WHITE
            )

            restart = small_font.render(
                "Press R to Restart",
                True,
                WHITE
            )

            screen.blit(over, (70, 180))
            screen.blit(score_text, (140, 300))
            screen.blit(high_text, (80, 360))
            screen.blit(restart, (120, 450))

            pygame.display.update()

            await asyncio.sleep(0)

            continue

        # Bird movement
        bird_velocity += gravity
        bird_y += bird_velocity

        draw_bird(bird_x, bird_y)

        bird_rect = pygame.Rect(
            bird_x - bird_radius,
            bird_y - bird_radius,
            bird_radius * 2,
            bird_radius * 2
        )

        new_pipes = []

        for top_pipe, bottom_pipe in pipes:

            top_pipe.x -= pipe_speed
            bottom_pipe.x -= pipe_speed

            pygame.draw.rect(screen, GREEN, top_pipe)
            pygame.draw.rect(screen, GREEN, bottom_pipe)

            pygame.draw.rect(
                screen,
                DARK_GREEN,
                (
                    top_pipe.x - 5,
                    top_pipe.height - 20,
                    pipe_width + 10,
                    20
                )
            )

            pygame.draw.rect(
                screen,
                DARK_GREEN,
                (
                    bottom_pipe.x - 5,
                    bottom_pipe.y,
                    pipe_width + 10,
                    20
                )
            )

            # Collision
            if bird_rect.colliderect(top_pipe) or bird_rect.colliderect(bottom_pipe):
                game_over = True

            # Score
            if top_pipe.x == bird_x:

                score += 1

                if score > high_score:
                    high_score = score

            # Keep pipes
            if top_pipe.x > -pipe_width:
                new_pipes.append((top_pipe, bottom_pipe))

        pipes = new_pipes

        # Add new pipes
        if len(pipes) == 0 or pipes[-1][0].x < WIDTH - 250:
            pipes.append(create_pipe())

        # Ground
        pygame.draw.rect(
            screen,
            BROWN,
            (
                0,
                HEIGHT - ground_height,
                WIDTH,
                ground_height
            )
        )

        # Top/bottom collision
        if bird_y < 0 or bird_y > HEIGHT - ground_height:
            game_over = True

        # Score display
        score_text = font.render(
            str(score),
            True,
            WHITE
        )

        screen.blit(score_text, (230, 40))

        pygame.display.update()

        await asyncio.sleep(0)

    pygame.quit()


asyncio.run(main())
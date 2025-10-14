-- Create profiles table for user information
create table public.profiles (
  id uuid not null references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Profiles are viewable by everyone" 
on public.profiles 
for select 
using (true);

create policy "Users can update their own profile" 
on public.profiles 
for update 
using (auth.uid() = id);

create policy "Users can insert their own profile" 
on public.profiles 
for insert 
with check (auth.uid() = id);

-- Create trigger function for new user profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create portfolios table
create table public.portfolios (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
  balance decimal(15, 2) not null default 100000,
  total_invested decimal(15, 2) not null default 0,
  current_value decimal(15, 2) not null default 0,
  profit_loss decimal(15, 2) not null default 0,
  profit_loss_percent decimal(10, 4) not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique(user_id)
);

-- Enable RLS
alter table public.portfolios enable row level security;

-- Portfolio policies
create policy "Users can view their own portfolio" 
on public.portfolios 
for select 
using (auth.uid() = user_id);

create policy "Users can update their own portfolio" 
on public.portfolios 
for update 
using (auth.uid() = user_id);

create policy "Users can insert their own portfolio" 
on public.portfolios 
for insert 
with check (auth.uid() = user_id);

-- Create holdings table
create table public.holdings (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
  symbol text not null,
  name text not null,
  quantity integer not null,
  avg_price decimal(15, 2) not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique(user_id, symbol)
);

-- Enable RLS
alter table public.holdings enable row level security;

-- Holdings policies
create policy "Users can view their own holdings" 
on public.holdings 
for select 
using (auth.uid() = user_id);

create policy "Users can manage their own holdings" 
on public.holdings 
for all 
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Create transactions table
create table public.transactions (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
  type text not null check (type in ('BUY', 'SELL')),
  symbol text not null,
  name text not null,
  quantity integer not null,
  price decimal(15, 2) not null,
  total decimal(15, 2) not null,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.transactions enable row level security;

-- Transactions policies
create policy "Users can view their own transactions" 
on public.transactions 
for select 
using (auth.uid() = user_id);

create policy "Users can insert their own transactions" 
on public.transactions 
for insert 
with check (auth.uid() = user_id);

-- Create updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add triggers for updated_at
create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

create trigger update_portfolios_updated_at
before update on public.portfolios
for each row execute function public.update_updated_at_column();

create trigger update_holdings_updated_at
before update on public.holdings
for each row execute function public.update_updated_at_column();

-- Create a function to initialize portfolio for new users
create or replace function public.initialize_portfolio()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.portfolios (user_id, balance, total_invested, current_value, profit_loss, profit_loss_percent)
  values (new.id, 100000, 0, 0, 0, 0);
  return new;
end;
$$;

-- Trigger to create portfolio on signup
create trigger on_auth_user_created_portfolio
  after insert on auth.users
  for each row execute procedure public.initialize_portfolio();